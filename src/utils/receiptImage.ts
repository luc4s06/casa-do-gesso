import html2canvas from 'html2canvas'

async function waitForImages(node: HTMLElement): Promise<void> {
  const images = Array.from(node.querySelectorAll('img'))
  await Promise.all(
    images.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            img.onload = () => resolve()
            img.onerror = () => resolve()
          })
    )
  )
  if ('fonts' in document) await document.fonts.ready
}

// Desenha o elemento (o comprovante) numa imagem PNG em alta resolução.
export async function renderToPngBlob(node: HTMLElement): Promise<Blob> {
  await waitForImages(node)
  const canvas = await html2canvas(node, {
    scale: 2,
    backgroundColor: '#ffffff',
    useCORS: true,
    logging: false,
  })
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error('Não foi possível gerar a imagem.'))), 'image/png')
  })
}

export type ShareResult = 'shared' | 'downloaded' | 'cancelled'

// No celular abre a lista de compartilhamento (com o WhatsApp); no computador baixa o arquivo.
export async function sharePngOrDownload(blob: Blob, filename: string, text?: string): Promise<ShareResult> {
  const file = new File([blob], filename, { type: 'image/png' })

  if (typeof navigator !== 'undefined' && typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], text })
      return 'shared'
    } catch (err) {
      // Pessoa fechou a lista de compartilhamento: não é erro, e não deve baixar nada.
      if (err instanceof DOMException && err.name === 'AbortError') return 'cancelled'
      // Qualquer outro problema: cai para o download.
    }
  }

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  return 'downloaded'
}
