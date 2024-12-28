from django import forms
from .models import EconomicAnalysis, EarningsRow
from django.forms import inlineformset_factory
from crispy_forms.helper import FormHelper
from crispy_forms.layout import Layout, Submit, Row, Column, Div

class DateInput(forms.DateInput):
    input_type = 'date'

class EconomicAnalysisForm(forms.ModelForm):
    class Meta:
        model = EconomicAnalysis
        fields = '__all__'
        widgets = {
            'date_of_birth': DateInput(),
            'date_of_injury': DateInput(),
            'date_of_retirement': DateInput(),
        }

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.helper = FormHelper()
        self.helper.layout = Layout(
            Div(
                Row(
                    Column('date_of_birth', css_class='form-group col-md-4'),
                    Column('date_of_injury', css_class='form-group col-md-4'),
                    Column('date_of_retirement', css_class='form-group col-md-4'),
                    css_class='form-row'
                ),
                css_class='mb-4'
            ),
            Div(
                Row(
                    Column('pre_growth_rate', css_class='form-group col-md-6'),
                    Column('pre_aef', css_class='form-group col-md-6'),
                    css_class='form-row'
                ),
                css_class='mb-4'
            ),
            Div(
                Row(
                    Column('post_growth_rate', css_class='form-group col-md-6'),
                    Column('post_aef', css_class='form-group col-md-6'),
                    css_class='form-row'
                ),
                css_class='mb-4'
            ),
            Div(
                Row(
                    Column('hi_base_premium', css_class='form-group col-md-4'),
                    Column('hi_growth_rate', css_class='form-group col-md-4'),
                    Column('hi_discount_rate', css_class='form-group col-md-4'),
                    css_class='form-row'
                ),
                css_class='mb-4'
            ),
            Div(
                Row(
                    Column('worklife_expectancy', css_class='form-group col-md-6'),
                    Column('life_expectancy', css_class='form-group col-md-6'),
                    css_class='form-row'
                ),
                css_class='mb-4'
            ),
            Submit('submit', 'Calculate', css_class='btn btn-primary')
        )

    def clean(self):
        cleaned_data = super().clean()
        date_of_birth = cleaned_data.get('date_of_birth')
        date_of_injury = cleaned_data.get('date_of_injury')
        date_of_retirement = cleaned_data.get('date_of_retirement')

        if date_of_birth and date_of_injury and date_of_retirement:
            if date_of_birth >= date_of_injury:
                raise forms.ValidationError("Date of birth must be before date of injury")
            if date_of_injury >= date_of_retirement:
                raise forms.ValidationError("Date of injury must be before retirement date")

        return cleaned_data

class EarningsRowForm(forms.ModelForm):
    class Meta:
        model = EarningsRow
        fields = ['year', 'portion_of_year', 'age', 'wage_base']
        widgets = {
            'portion_of_year': forms.NumberInput(attrs={'step': '0.01', 'min': '0', 'max': '1'}),
            'age': forms.NumberInput(attrs={'step': '0.01'}),
            'wage_base': forms.NumberInput(attrs={'step': '0.01'})
        }

# Create formsets for pre and post injury earnings rows
PreInjuryFormSet = inlineformset_factory(
    EconomicAnalysis,
    EarningsRow,
    form=EarningsRowForm,
    extra=1,
    can_delete=True,
    fields=['year', 'portion_of_year', 'age', 'wage_base']
)

PostInjuryFormSet = inlineformset_factory(
    EconomicAnalysis,
    EarningsRow,
    form=EarningsRowForm,
    extra=1,
    can_delete=True,
    fields=['year', 'portion_of_year', 'age', 'wage_base']
)
