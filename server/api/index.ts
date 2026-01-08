import type { VercelRequest, VercelResponse } from '@vercel/node';

// Handler de diagnóstico simple
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Log básico
    console.log('Request received:', req.method, req.url);
    
    // Respuesta de diagnóstico
    return res.status(200).json({
      status: 'Server is alive',
      message: 'Backend básico funcionando - NestJS temporalmente deshabilitado',
      method: req.method,
      url: req.url,
      timestamp: new Date().toISOString(),
      note: 'NestJS requiere un servidor tradicional, no serverless'
    });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
