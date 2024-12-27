from seleniumbase import BaseCase
import time

class TestAEFCalculator(BaseCase):
    def setUp(self):
        super().setUp()
        self.open("http://localhost:5174")
        # Wait for React to hydrate and render
        time.sleep(2)
        # Print page source for debugging
        print("Page source:", self.get_page_source())

    def test_default_values(self):
        """Test that AEF Calculator loads with correct default values"""
        # Check if calculator form is present
        self.assert_element("form.space-y-6[role='form']")
        
        # Verify default values
        self.assert_element_attribute("#base", "value", "100")
        self.assert_element_attribute("#worklifeAdjustment", "value", "85.7")
        self.assert_element_attribute("#unemploymentFactor", "value", "4.2")
        self.assert_element_attribute("#incomeTaxRate", "value", "22")
        self.assert_element_attribute("#fringeBenefits", "value", "23.5")
        self.assert_element_attribute("#personalConsumption", "value", "30")

    def test_input_validation(self):
        """Test input validation for negative values and personal consumption > 100%"""
        # Set invalid values
        self.clear("#base")
        self.type("#base", "-50")
        
        self.clear("#personalConsumption")
        self.type("#personalConsumption", "150")
        
        # Click calculate button
        self.click("button[type='submit']")
        
        # Check error messages
        self.assert_text("Value cannot be negative", "p[role='alert']")
        self.assert_text("Personal consumption cannot exceed 100%", "p[role='alert']")
        
        # Verify both error messages are present
        error_messages = self.find_elements("p[role='alert']")
        self.assertEqual(len(error_messages), 2)

    def test_personal_consumption_toggle(self):
        """Test toggling of personal consumption input"""
        # Initially personal consumption input should be visible
        self.assert_element_visible("#personalConsumption")
        
        # Uncheck the apply personal consumption checkbox
        self.click("input[name='applyPersonalConsumption']")
        
        # Personal consumption input should be hidden
        self.assert_element_not_visible("#personalConsumption")
        
        # Check the checkbox again
        self.click("input[name='applyPersonalConsumption']")
        
        # Personal consumption input should be visible again
        self.assert_element_visible("#personalConsumption")

    def test_calculation_with_custom_values(self):
        """Test AEF calculation with custom input values"""
        # Set custom values
        test_values = {
            "base": "90",
            "worklifeAdjustment": "80",
            "unemploymentFactor": "5",
            "incomeTaxRate": "20",
            "fringeBenefits": "25",
            "personalConsumption": "25"
        }
        
        # Fill in each input
        for field, value in test_values.items():
            self.clear(f"#{field}")
            self.type(f"#{field}", value)
        
        # Calculate
        self.click("button[type='submit']")
        
        # Verify results section appears
        self.assert_element("div[role='region'][aria-label='Calculation Results']")
        
        # Verify all result sections contain percentage values
        result_ids = [
            "worklife-result",
            "unemployment-result",
            "tax-result",
            "benefits-result",
            "final-result"
        ]
        
        for result_id in result_ids:
            self.assert_element(f"[data-testid='{result_id}']")
            result_text = self.get_text(f"[data-testid='{result_id}']")
            self.assertIn("%", result_text)
