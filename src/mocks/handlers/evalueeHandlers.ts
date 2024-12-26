import { http } from 'msw';
import { HttpRequest, HttpResponse, DefaultBodyType, PathParams } from 'msw';

const mockEvaluees = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    createdAt: new Date().toISOString(),
  }
];

export const evalueeHandlers = [
  // Mock GET all evaluees
  http.get('/api/evaluees', () => {
    return HttpResponse.json(mockEvaluees, { status: 200 });
  }),

  // Mock GET evaluee by ID
  http.get('/api/evaluees/:id', ({ params }: HttpRequest) => {
    const { id } = params as PathParams<{ id: string }>;
    const evaluee = mockEvaluees.find(e => e.id === id);

    if (!evaluee) {
      return HttpResponse.json({ detail: 'Evaluee not found' }, { status: 404 });
    }

    return HttpResponse.json(evaluee, { status: 200 });
  }),

  // Mock CREATE evaluee
  http.post('/api/evaluees', async (req: HttpRequest) => {
    const newEvaluee = await req.json();
    
    if (!newEvaluee.name || !newEvaluee.email) {
      return HttpResponse.json({ detail: 'Name and email are required' }, { status: 400 });
    }

    const createdEvaluee = {
      ...newEvaluee,
      id: (mockEvaluees.length + 1).toString(),
      createdAt: new Date().toISOString(),
    };

    mockEvaluees.push(createdEvaluee);

    return HttpResponse.json(createdEvaluee, { status: 201 });
  }),

  // Mock UPDATE evaluee
  http.put('/api/evaluees/:id', async ({ params, request }: HttpRequest) => {
    const { id } = params as PathParams<{ id: string }>;
    const updatedData = await request.json();

    const evalueeIndex = mockEvaluees.findIndex(e => e.id === id);

    if (evalueeIndex === -1) {
      return HttpResponse.json({ detail: 'Evaluee not found' }, { status: 404 });
    }

    const updatedEvaluee = {
      ...mockEvaluees[evalueeIndex],
      ...updatedData,
    };

    mockEvaluees[evalueeIndex] = updatedEvaluee;

    return HttpResponse.json(updatedEvaluee, { status: 200 });
  }),

  // Mock DELETE evaluee
  http.delete('/api/evaluees/:id', ({ params }: HttpRequest) => {
    const { id } = params as PathParams<{ id: string }>;
    const evalueeIndex = mockEvaluees.findIndex(e => e.id === id);

    if (evalueeIndex === -1) {
      return HttpResponse.json({ detail: 'Evaluee not found' }, { status: 404 });
    }

    mockEvaluees.splice(evalueeIndex, 1);

    return new HttpResponse(null, { status: 204 });
  }),
];
