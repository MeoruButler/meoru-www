export type PhotoExif = {
  camera: string
  lens: string
  focalLength: string
  aperture: string
  shutter: string
  iso: number
}

export type LocalizedString = {
  en: string
  ko: string
}

export type PhotoLocation = {
  name?: LocalizedString
  lat?: number
  lng?: number
}

export type Photo = {
  id: string
  src: string
  medium?: string
  thumb?: string
  alt: string
  collection: string
  takenAt: string
  caption?: string
  exif: PhotoExif
  location?: PhotoLocation
  hidden?: boolean
}

export type PhotoEntry = Photo & {
  localFile?: string
}
