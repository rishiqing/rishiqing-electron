const fileTypeMap: {
  [key: string]: string
} = {
  '.doc': 'word',
  '.docx': 'word',
  '.ppt': 'ppt', // ppt
  '.pptx': 'ppt',
  '.xls': 'excel', // excel
  '.xlsx': 'excel',
  '.pdf': 'pdf', // pdf
  '.jpg': 'image', // 图片
  '.png': 'image',
  '.gif': 'image',
  '.bmp': 'image',
  '.jpeg': 'image',
  '.mp3': 'sound', // 音频
  '.wav': 'sound',
  '.mp4': 'video', // 视频
  '.avi': 'video',
  '.flv': 'video',
  '.wmv': 'video',
  '.rmvb': 'video',
  '.rm': 'video',
  '.zip': 'zip', // 压缩文件
  '.rar': 'zip',
  '.km': 'minder', // 思维导图文件
  '.xmind': 'minder',
  '.mm': 'minder',
}

export const getFileSize = (bytes: number) => {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  if (bytes === 0) return '0 B'
  const radix = Math.floor(Math.log(bytes) / Math.log(1024))
  const i = parseInt(String(radix), 10)
  return (bytes / Math.pow(1024, i)).toFixed(2) + '' + sizes[i]
}

export const getFileTail = (fileName: string) => {
  if (!fileName) return fileName
  const index = fileName.lastIndexOf('.')
  if (index < 0) return ''
  return fileName.substring(index).toLowerCase()
}

export const getFileSmallImage = (fileName: string) => {
  const tail = getFileTail(fileName)
  return fileTypeMap[tail] ? fileTypeMap[tail] : 'file'
}
