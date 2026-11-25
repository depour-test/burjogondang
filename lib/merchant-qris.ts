// Adapted from verssache/qris-dinamis (src/core/converter.ts and crc16.ts).
// Copyright (c) 2020 QRIS Dinamis. MIT license in qris-dinamis.LICENSE.

type Field = {tag: string; value: string}
const invalid = 'Teks QRIS tidak valid. Coba pindai ulang QRIS asli dari aplikasi merchant.'

function parseFields(payload: string): Field[] {
  const characters = Array.from(payload)
  const fields: Field[] = []
  const seen = new Set<string>()
  for (let i = 0; i < characters.length;) {
    const tag = characters.slice(i, i + 2).join('')
    const size = characters.slice(i + 2, i + 4).join('')
    const end = i + 4 + Number(size)
    if (!/^\d{2}$/.test(tag) || !/^\d{2}$/.test(size) || Number(size) < 1 || end > characters.length || seen.has(tag)) {
      throw new Error(invalid)
    }
    fields.push({tag, value: characters.slice(i + 4, end).join('')})
    seen.add(tag)
    i = end
  }
  return fields
}

function crc16(text: string) {
  let crc = 0xffff
  for (const byte of new TextEncoder().encode(text)) {
    crc ^= byte << 8
    for (let bit = 0; bit < 8; bit++) {
      crc = ((crc << 1) ^ ((crc & 0x8000) ? 0x1021 : 0)) & 0xffff
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0')
}

function merchantFields(input: string) {
  const payload = input.trim()
  if (!payload.startsWith('000201') || new TextEncoder().encode(payload).length > 1600 || /[\u0000-\u001f\u007f]/.test(payload)) throw new Error(invalid)

  const fields = parseFields(payload)
  const read = (tag: string) => fields.find(field => field.tag === tag)?.value
  const checksum = fields.at(-1)
  if (checksum?.tag !== '63' || checksum.value.length !== 4 || crc16(payload.slice(0, -4)) !== checksum.value.toUpperCase()) {
    throw new Error('Checksum QRIS tidak cocok. Pakai kode asli dari aplikasi merchant.')
  }
  const name = read('59')?.trim(), city = read('60')?.trim()
  const merchantAccount = fields.some(field => {
    if (Number(field.tag) < 26 || Number(field.tag) > 51) return false
    const nested = parseFields(field.value)
    return nested[0]?.tag === '00' && nested.length > 1
  })
  if (!name || !city || !merchantAccount || !/^\d{4}$/.test(read('52') || '') || read('53') !== '360' || read('58') !== 'ID') {
    throw new Error('Masukkan QRIS merchant Indonesia dengan mata uang rupiah.')
  }
  const method = read('01')
  if ((method !== undefined && method !== '11') || read('54')) {
    throw new Error('Masukkan QRIS statis tanpa nominal.')
  }
  if (['55','56','57'].some(tag => read(tag))) {
    throw new Error('Pakai QRIS statis tanpa tip atau biaya tambahan.')
  }
  return {fields, name, city}
}

export function inspectMerchantQris(input: string) {
  const {name, city} = merchantFields(input)
  return {name, city}
}

export function generateMerchantQris(input: string, amount: number) {
  if (!Number.isSafeInteger(amount) || amount < 1 || amount > 10_000_000) {
    throw new Error('Nominal QRIS warung harus antara Rp1 dan Rp10.000.000.')
  }
  const {fields, name} = merchantFields(input)
  const converted: Field[] = []
  for (const field of fields) {
    if (field.tag === '63' || field.tag === '01') continue
    if (field.tag === '58') converted.push({tag:'54', value:String(amount)})
    converted.push(field)
    if (field.tag === '00') converted.push({tag:'01', value:'12'})
  }
  const code = converted.map(({tag, value}) => tag + Array.from(value).length.toString().padStart(2, '0') + value).join('') + '6304'
  return {payload:code + crc16(code), name}
}
