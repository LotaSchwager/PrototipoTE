import Image from "next/image"

export function PUCVLogo() {
  return (
    <div className="flex items-center">
      <Image src="/icono.webp" alt="Logo PUCV" width={40} height={40} className="mr-2" />
      <span className="font-semibold text-lg hidden sm:inline">Asistente virtual</span>
    </div>
  )
}
