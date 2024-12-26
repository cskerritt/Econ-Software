import axios from 'axios';
import { healthcareService } from '../services/healthcareService';
import { API_BASE_URL } from '../config';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('Healthcare Service', () => {
  const API_URL = API_BASE_URL;
  
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCategory', () => {
    const categoryId = 1;

    it('fetches a category successfully', async () => {
      const category = {
        id: categoryId,
        name: 'Primary Care',
        description: 'Regular checkups',
        growth_rate: 0.03,
        frequency_years: 1
      };
      mockedAxios.get.mockResolvedValueOnce({ data: category });

      const result = await healthcareService.getCategory(categoryId);
      expect(result).toEqual(category);
      expect(mockedAxios.get).toHaveBeenCalledWith(`${API_URL}/healthcare-categories/${categoryId}/`);
    });

    it('handles 404 error when category not found', async () => {
      const error = {
        response: {
          status: 404,
          data: { detail: 'Category not found' }
        }
      };
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(healthcareService.getCategory(categoryId))
        .rejects.toEqual(error.response.data);
    });
  });

  describe('getCategories', () => {
    it('fetches categories successfully', async () => {
      const categories = [
        { id: 1, name: 'Primary Care', growth_rate: 0.03, frequency_years: 1 }
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: categories });

      const result = await healthcareService.getCategories();
      expect(result).toEqual(categories);
      expect(mockedAxios.get).toHaveBeenCalledWith(`${API_URL}/healthcare-categories/`);
    });

    it('handles errors when fetching categories', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(healthcareService.getCategories()).rejects.toThrow('Network error');
    });
  });

  describe('getPlan', () => {
    const analysisId = 1;
    const planId = 1;

    it('fetches a plan successfully', async () => {
      const plan = {
        id: planId,
        category: {
          id: 1,
          name: 'Primary Care',
          growth_rate: 0.03,
          frequency_years: 1
        },
        base_cost: 1000,
        is_active: true
      };
      mockedAxios.get.mockResolvedValueOnce({ data: plan });

      const result = await healthcareService.getPlan(analysisId, planId);
      expect(result).toEqual(plan);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${API_URL}/analyses/${analysisId}/healthcare-plans/${planId}/`
      );
    });

    it('handles 404 error when plan not found', async () => {
      const error = {
        response: {
          status: 404,
          data: { detail: 'Plan not found' }
        }
      };
      mockedAxios.get.mockRejectedValueOnce(error);

      await expect(healthcareService.getPlan(analysisId, planId))
        .rejects.toEqual(error.response.data);
    });
  });

  describe('getPlans', () => {
    const analysisId = 1;

    it('fetches plans successfully', async () => {
      const plans = [
        { id: 1, category_id: 1, base_cost: 1000, is_active: true }
      ];
      mockedAxios.get.mockResolvedValueOnce({ data: plans });

      const result = await healthcareService.getPlans(analysisId);
      expect(result).toEqual(plans);
      expect(mockedAxios.get).toHaveBeenCalledWith(`${API_URL}/analyses/${analysisId}/healthcare-plans/`);
    });

    it('handles errors when fetching plans', async () => {
      mockedAxios.get.mockRejectedValueOnce(new Error('Network error'));

      await expect(healthcareService.getPlans(analysisId)).rejects.toThrow('Network error');
    });
  });

  describe('createPlan', () => {
    it('handles validation errors when creating a plan', async () => {
      const analysisId = 1;
      const invalidPlanData = {
        category_id: 1,
        base_cost: -1000,  // Invalid: negative cost
        is_active: true
      };

      const error = {
        response: {
          status: 400,
          data: {
            base_cost: ['Base cost must be positive']
          }
        }
      };
      mockedAxios.post.mockRejectedValueOnce(error);

      await expect(healthcareService.createPlan(analysisId, invalidPlanData))
        .rejects.toEqual(error.response.data);
    });
    const analysisId = 1;
    const planData = {
      category_id: 1,
      base_cost: 1000,
      is_active: true
    };

    it('creates a plan successfully', async () => {
      const createdPlan = { ...planData, id: 1 };
      mockedAxios.post.mockResolvedValueOnce({ data: createdPlan });

      const result = await healthcareService.createPlan(analysisId, planData);
      expect(result).toEqual(createdPlan);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${API_URL}/analyses/${analysisId}/healthcare-plans/`,
        planData
      );
    });

    it('handles errors when creating a plan', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

      await expect(healthcareService.createPlan(analysisId, planData)).rejects.toThrow('Network error');
    });
  });

  describe('updatePlan', () => {
    const analysisId = 1;
    const planId = 1;
    const updateData = {
      base_cost: 2000,
      is_active: false
    };

    it('updates a plan successfully', async () => {
      const updatedPlan = {
        id: planId,
        category: {
          id: 1,
          name: 'Primary Care',
          growth_rate: 0.03,
          frequency_years: 1
        },
        ...updateData
      };
      mockedAxios.put.mockResolvedValueOnce({ data: updatedPlan });

      const result = await healthcareService.updatePlan(analysisId, planId, updateData);
      expect(result).toEqual(updatedPlan);
      expect(mockedAxios.put).toHaveBeenCalledWith(
        `${API_URL}/analyses/${analysisId}/healthcare-plans/${planId}/`,
        updateData
      );
    });

    it('handles validation errors when updating a plan', async () => {
      const invalidUpdateData = {
        base_cost: -2000  // Invalid: negative cost
      };

      const error = {
        response: {
          status: 400,
          data: {
            base_cost: ['Base cost must be positive']
          }
        }
      };
      mockedAxios.put.mockRejectedValueOnce(error);

      await expect(healthcareService.updatePlan(analysisId, planId, invalidUpdateData))
        .rejects.toEqual(error.response.data);
    });

    it('handles 404 error when updating non-existent plan', async () => {
      const error = {
        response: {
          status: 404,
          data: { detail: 'Plan not found' }
        }
      };
      mockedAxios.put.mockRejectedValueOnce(error);

      await expect(healthcareService.updatePlan(analysisId, planId, updateData))
        .rejects.toEqual(error.response.data);
    });
  });

  describe('deletePlan', () => {
    const analysisId = 1;
    const planId = 1;

    it('deletes a plan successfully', async () => {
      mockedAxios.delete.mockResolvedValueOnce({ data: null });

      await healthcareService.deletePlan(analysisId, planId);
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        `${API_URL}/analyses/${analysisId}/healthcare-plans/${planId}/`
      );
    });

    it('handles 404 error when deleting non-existent plan', async () => {
      const error = {
        response: {
          status: 404,
          data: { detail: 'Plan not found' }
        }
      };
      mockedAxios.delete.mockRejectedValueOnce(error);

      await expect(healthcareService.deletePlan(analysisId, planId))
        .rejects.toEqual(error.response.data);
    });
  });

  describe('togglePlan', () => {
    const analysisId = 1;
    const planId = 1;

    it('toggles a plan successfully', async () => {
      const toggledPlan = { id: 1, is_active: false };
      mockedAxios.post.mockResolvedValueOnce({ data: toggledPlan });

      const result = await healthcareService.togglePlan(analysisId, planId);
      expect(result).toEqual(toggledPlan);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${API_URL}/analyses/${analysisId}/healthcare-plans/${planId}/toggle/`
      );
    });

    it('handles errors when toggling a plan', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

      await expect(healthcareService.togglePlan(analysisId, planId)).rejects.toThrow('Network error');
    });
  });

  describe('partial updates', () => {
    const analysisId = 1;
    const planId = 1;

    it('partially updates a plan successfully', async () => {
      const patchData = { base_cost: 2000 };
      const updatedPlan = {
        id: planId,
        category: {
          id: 1,
          name: 'Primary Care',
          growth_rate: 0.03,
          frequency_years: 1
        },
        base_cost: 2000,
        is_active: true
      };
      mockedAxios.patch.mockResolvedValueOnce({ data: updatedPlan });

      const result = await healthcareService.patchPlan(analysisId, planId, patchData);
      expect(result).toEqual(updatedPlan);
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        `${API_URL}/analyses/${analysisId}/healthcare-plans/${planId}/`,
        patchData
      );
    });

    it('handles validation errors in partial updates', async () => {
      const invalidPatchData = { base_cost: -2000 };
      const error = {
        response: {
          status: 400,
          data: { base_cost: ['Base cost must be positive'] }
        }
      };
      mockedAxios.patch.mockRejectedValueOnce(error);

      await expect(healthcareService.patchPlan(analysisId, planId, invalidPatchData))
        .rejects.toEqual(error.response.data);
    });
  });

  describe('batch operations', () => {
    const analysisId = 1;

    it('updates multiple plans successfully', async () => {
      const batchUpdates = [
        { id: 1, base_cost: 2000 },
        { id: 2, is_active: false }
      ];
      const updatedPlans = batchUpdates.map(update => ({
        ...update,
        category: {
          id: 1,
          name: 'Primary Care',
          growth_rate: 0.03,
          frequency_years: 1
        }
      }));
      mockedAxios.patch.mockResolvedValueOnce({ data: updatedPlans });

      const result = await healthcareService.batchUpdatePlans(analysisId, batchUpdates);
      expect(result).toEqual(updatedPlans);
      expect(mockedAxios.patch).toHaveBeenCalledWith(
        `${API_URL}/analyses/${analysisId}/healthcare-plans/batch/`,
        { plans: batchUpdates }
      );
    });

    it('handles partial failures in batch updates', async () => {
      const batchUpdates = [
        { id: 1, base_cost: -2000 },
        { id: 2, is_active: false }
      ];
      const error = {
        response: {
          status: 400,
          data: {
            plans: [
              { base_cost: ['Base cost must be positive'] },
              null
            ]
          }
        }
      };
      mockedAxios.patch.mockRejectedValueOnce(error);

      await expect(healthcareService.batchUpdatePlans(analysisId, batchUpdates))
        .rejects.toEqual(error.response.data);
    });
  });

  describe('request handling', () => {
    const analysisId = 1;
    const planId = 1;

    it('cancels pending requests when making new ones', async () => {
      const mockAbortController = new AbortController();
      jest.spyOn(window, 'AbortController').mockImplementation(() => mockAbortController);

      // Start a request that will take some time
      const slowRequest = healthcareService.getPlan(analysisId, planId);
      
      // Start another request before the first one completes
      const fastRequest = healthcareService.getPlan(analysisId, planId);
      
      // Verify the first request was aborted
      expect(mockAbortController.abort).toHaveBeenCalled();
      
      // Complete the requests
      mockedAxios.get.mockResolvedValueOnce({ data: { id: planId } });
      await fastRequest;
    });

    it('retries failed requests', async () => {
      mockedAxios.get
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({ data: { id: planId } });

      const result = await healthcareService.getPlan(analysisId, planId);
      expect(result).toEqual({ id: planId });
      expect(mockedAxios.get).toHaveBeenCalledTimes(3);
    });

    it('validates response data structure', async () => {
      const invalidResponse = {
        data: {
          id: planId,
          category: 'invalid-category-format'  // Should be an object
        }
      };
      mockedAxios.get.mockResolvedValueOnce(invalidResponse);

      await expect(healthcareService.getPlan(analysisId, planId))
        .rejects.toThrow('Invalid response format');
    });
  });

  describe('calculateCosts', () => {
    it('handles validation errors when calculating costs', async () => {
      const analysisId = 1;
      const error = {
        response: {
          status: 400,
          data: {
            detail: 'No active healthcare plans found'
          }
        }
      };
      mockedAxios.post.mockRejectedValueOnce(error);

      await expect(healthcareService.calculateCosts(analysisId))
        .rejects.toEqual(error.response.data);
    });

    it('handles 404 error when analysis not found', async () => {
      const analysisId = 9999;
      const error = {
        response: {
          status: 404,
          data: { detail: 'Analysis not found' }
        }
      };
      mockedAxios.post.mockRejectedValueOnce(error);

      await expect(healthcareService.calculateCosts(analysisId))
        .rejects.toEqual(error.response.data);
    });
    const analysisId = 1;

    it('calculates costs successfully', async () => {
      const response = { status: 'Costs calculated successfully' };
      mockedAxios.post.mockResolvedValueOnce({ data: response });

      await healthcareService.calculateCosts(analysisId);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${API_URL}/analyses/${analysisId}/calculate-healthcare-costs/`
      );
    });

    it('handles errors when calculating costs', async () => {
      mockedAxios.post.mockRejectedValueOnce(new Error('Network error'));

      await expect(healthcareService.calculateCosts(analysisId)).rejects.toThrow('Network error');
    });
  });
});
