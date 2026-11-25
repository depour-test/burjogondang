'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Camera, ImagePlus } from 'lucide-react'
import type { Methods, QrisProvider, Settings } from '../../lib/shop'
import { inspectMerchantQris } from '../../lib/merchant-qris'
import { errorText } from '../../lib/http'

function qrPixels(source: CanvasImageSource, width: number, height: number, canvas: HTMLCanvasElement) {
  const scale = Math.min(1, 1400/Math.max(width,height))
  canvas.width = Math.max(1,Math.round(width*scale))
  canvas.height = Math.max(1,Math.round(height*scale))
  const context = canvas.getContext('2d',{willReadFrequently:true})
  if (!context) throw new Error('Gambar QRIS tidak dapat dibaca.')
  context.drawImage(source,0,0,canvas.width,canvas.height)
  return context.getImageData(0,0,canvas.width,canvas.height)
}

export default function QrisSettings({ settings, methods, busy, save }: {
  settings:Settings;methods:Methods;busy:boolean;save:(value:{qrisProvider:QrisProvider;merchantQris:string})=>void
}) {
  const [provider,setProvider] = useState(settings.qrisProvider)
  const [payload,setPayload] = useState(settings.merchantQris)
  const [issue,setIssue] = useState('')
  const [reading,setReading] = useState(false)
  const [camera,setCamera] = useState(false)
  const video = useRef<HTMLVideoElement>(null)

  const validation = useMemo(()=>{
    if (!payload.trim()) return {merchant:null,error:''}
    try { return {merchant:inspectMerchantQris(payload),error:''} }
    catch (error) { return {merchant:null,error:errorText(error)} }
  },[payload])

  useEffect(()=>{
    if (!camera) return
    let active = true
    let stream: MediaStream | undefined
    let timer: number | undefined
    async function start() {
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('Kamera tidak tersedia. Gunakan foto QRIS.')
        const reader = (await import('jsqr')).default
        stream = await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false})
        if (!active) { stream.getTracks().forEach(track=>track.stop()); return }
        const frame = video.current
        if (!frame) return
        frame.srcObject = stream
        await frame.play()
        if (!active) return
        const canvas = document.createElement('canvas')
        timer = window.setInterval(()=>{
          if (!frame.videoWidth || frame.readyState < 2) return
          try {
            const pixels = qrPixels(frame,frame.videoWidth,frame.videoHeight,canvas)
            const code = reader(pixels.data,pixels.width,pixels.height,{inversionAttempts:'dontInvert'})
            if (code?.data) {setPayload(code.data);setIssue('');setCamera(false)}
          } catch (error) {setIssue(errorText(error));setCamera(false)}
        },250)
      } catch {
        if (active) {setIssue('Kamera tidak bisa dibuka. Gunakan foto atau tempel teks QRIS.');setCamera(false)}
      }
    }
    void start()
    return ()=>{active=false;clearInterval(timer);stream?.getTracks().forEach(track=>track.stop())}
  },[camera])

  async function decode(file: File) {
    if (reading) return
    setCamera(false);setReading(true);setIssue('')
    let bitmap:ImageBitmap|undefined
    try {
      if (!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size > 10_485_760) throw new Error('Pakai gambar PNG, JPG, atau WebP hingga 10 MB.')
      const reader = (await import('jsqr')).default
      bitmap = await createImageBitmap(file)
      const pixels = qrPixels(bitmap,bitmap.width,bitmap.height,document.createElement('canvas'))
      const code = reader(pixels.data,pixels.width,pixels.height,{inversionAttempts:'attemptBoth'})
      if (!code?.data) throw new Error('Kode QR tidak terbaca. Coba gambar yang lebih jelas.')
      setPayload(code.data)
    } catch (error) {setIssue(errorText(error))}
    finally {bitmap?.close();setReading(false)}
  }

  return <div className="settings-card payment-settings">
    <h2>Pembayaran</h2>
    <p><strong>WhatsApp</strong> <span className={'badge '+(!methods.whatsapp?'neutral':'')}>{methods.whatsapp?'Aktif':'Nomor belum diisi'}</span></p>
    <p><strong>QRIS</strong> <span className={'badge '+(!methods.qris?'neutral':'')}>{!methods.qris?'Belum aktif':methods.sandbox?'Uji coba':methods.qrisProvider==='merchant'?'Warung · verifikasi manual':'Midtrans · aktif'}</span></p>
    <form className="panel-form qris-settings-form" onSubmit={event=>{
      event.preventDefault()
      if (!validation.error && (provider!=='merchant'||validation.merchant) && !reading && !camera) {
        save({qrisProvider:provider,merchantQris:payload.trim()})
      }
    }}>
      <label>Sumber QRIS<select value={provider} onChange={event=>{setProvider(event.target.value as QrisProvider);setCamera(false);setIssue('')}}>
        <option value="midtrans">Midtrans</option>
        <option value="merchant">QRIS warung</option>
      </select></label>
      {provider === 'midtrans' ? <>
        <p className="muted">Aktifkan QRIS pada akun Midtrans, lalu atur <code>MIDTRANS_SERVER_KEY</code> dan <code>MIDTRANS_MODE</code> di server.</p>
        <p className="muted">URL notifikasi Midtrans <code>/api/midtrans/notification</code>.</p>
      </> : <>
        <p className="muted">Pakai QRIS statis resmi warung. Checkout mengisi nominal secara otomatis. Cocokkan pembayaran dari aplikasi merchant di menu Pesanan.</p>
        <label>Teks QRIS statis<textarea value={payload} maxLength={1600} required placeholder="Tempel teks QRIS atau gambar kode QR" onChange={event=>{setPayload(event.target.value);setIssue('')}} onPaste={event=>{
          const image = Array.from(event.clipboardData.files).find(file=>file.type.startsWith('image/'))
          if(image){event.preventDefault();void decode(image)}
        }}/></label>
        <div className="qris-input-actions">
          <label className="button outline upload-button"><ImagePlus size={16} aria-hidden="true"/> {reading?'Membaca…':'Pilih Foto QRIS'}
            <input type="file" accept="image/png,image/jpeg,image/webp" disabled={reading} onChange={event=>{const file=event.target.files?.[0];if(file)void decode(file);event.target.value=''}}/>
          </label>
          <button className="button outline" type="button" disabled={reading} onClick={()=>{setIssue('');setCamera(on=>!on)}}><Camera size={16} aria-hidden="true"/> {camera?'Tutup Kamera':'Pindai Kamera'}</button>
        </div>
        {camera&&<video className="qris-camera" width={480} height={360} ref={video} playsInline muted aria-label="Kamera pemindai QRIS"/>}
        {issue&&<p className="notice warning" role="alert">{issue}</p>}
        {validation.error&&<p className="notice warning" role="alert">{validation.error}</p>}
        {validation.merchant&&<p className="notice" role="status"><strong>{validation.merchant.name}</strong> · {validation.merchant.city}</p>}
      </>}
      <button className="button dark" type="submit" disabled={busy||reading||camera||(provider==='merchant'&&!validation.merchant)}>Simpan QRIS</button>
    </form>
  </div>
}
