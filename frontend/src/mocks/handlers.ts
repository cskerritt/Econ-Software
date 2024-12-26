import { http, HttpResponse } from 'msw'

export const handlers = [
  // Example handler for a GET request to fetch analyses
  http.get('/api/analyses', () => {
    return HttpResponse.json([
      { id: '1', title: 'Sample Analysis 1' },
      { id: '2', title: 'Sample Analysis 2' }
    ])
  }),

  // Example handler for a POST request to create an analysis
  http.post('/api/analyses', async ({ request }) => {
    const newAnalysis = await request.json()
    return HttpResponse.json(Object.assign({}, newAnalysis, {
      id: '3' // Simulate server-generated ID
    }), { status: 201 })
  })
]
