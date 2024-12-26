import { http } from 'msw';
import { HttpRequest, HttpResponse, DefaultBodyType, PathParams } from 'msw';
import { mockAnalysis } from '../../__tests__/AnalysisResults/mockData';

export const analysisResultsHandlers = [
  // Mock GET analysis by ID
  http.get('/api/analyses/:id', ({ params }: HttpRequest) => {
    const { id } = params as PathParams;
    
    // Simulate different response scenarios
    if (id === '404') {
      return HttpResponse.json({ detail: 'Analysis not found' }, { status: 404 });
    }

    if (id === '500') {
      return HttpResponse.json({ detail: 'Internal server error' }, { status: 500 });
    }

    return HttpResponse.json(mockAnalysis, { status: 200 });
  }),

  // Mock Excel download
  http.get('/api/analyses/:id/download/excel', ({ params }: HttpRequest) => {
    const { id } = params as PathParams;
    
    if (id === 'error') {
      return HttpResponse.json({ detail: 'Download failed' }, { status: 500 });
    }

    return new HttpResponse(new Blob(), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      },
      status: 200
    });
  }),

  // Mock Word download
  http.get('/api/analyses/:id/download/word', ({ params }: HttpRequest) => {
    const { id } = params as PathParams;
    
    if (id === 'error') {
      return HttpResponse.json({ detail: 'Download failed' }, { status: 500 });
    }

    return new HttpResponse(new Blob(), {
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      },
      status: 200
    });
  }),
];
