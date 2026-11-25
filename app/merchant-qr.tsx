'use client'

import { useEffect, useState } from 'react'
import { Download } from 'lucide-react'

export default function MerchantQr({ payload, orderId, merchantName }: {payload:string;orderId:string;merchantName:string|null}) {
  const [image,setImage] = useState('')
  const [error,setError] = useState(false)
  useEffect(()=>{
    let active = true
    import('qrcode')
      .then(qrcode=>qrcode.toDataURL(payload,{width:512,margin:4,errorCorrectionLevel:'M'}))
      .then(url=>{if(active)setImage(url)})
      .catch(()=>{if(active)setError(true)})
    return ()=>{active=false}
  },[payload])
  return <div className="merchant-qr">
    {image ? <img className="payment-qr" src={image} width={240} height={240} alt="Kode QRIS dengan nominal pesanan"/> : <p role="status">{error?'Kode tidak dapat ditampilkan. Muat ulang halaman status pesanan.':'Menyiapkan gambar QRIS…'}</p>}
    {merchantName&&<p>Nama merchant <strong>{merchantName}</strong></p>}
    <p>Cocokkan nama merchant dan total di aplikasi pembayaran. Warung akan memverifikasi pembayaran yang masuk.</p>
    {image&&<a className="button outline" href={image} download={'QRIS-'+orderId.toUpperCase()+'.png'}><Download size={16} aria-hidden="true"/> Simpan gambar QRIS</a>}
  </div>
}
