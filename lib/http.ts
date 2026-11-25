export async function request<T>(path: string, body?: object): Promise<T> {
  const response = await fetch('/api/'+path, body === undefined ? {cache:'no-store'} : {
    method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body),
  })
  return read<T>(response)
}

export async function read<T>(response: Response): Promise<T> {
  const result = await response.json<{error?:string}>().catch(()=>null)
  if (!response.ok) throw new Error(result?.error || 'Layanan sedang bermasalah. Coba lagi sebentar.')
  return result as T
}

export const errorText = (error: unknown) => error instanceof Error ? error.message : 'Terjadi kesalahan.'
