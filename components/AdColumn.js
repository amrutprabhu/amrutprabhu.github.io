import React from 'react'
import Image from './Image'
import Link from '@/components/Link'
function AdColumn({ width, height, imageLink, referalLink }) {
  return (
    <div className="border-4 border-teal-500 rounded-lg p-1">
      <Link href={referalLink}>
        <Image
          alt="title"
          src={`/${imageLink}`}
          className="object-cover object-center "
          width={width}
          height={height}
        />
      </Link>
    </div>
  )
}

export default AdColumn
