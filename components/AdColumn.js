import React from 'react'
import Image from './Image'
import Link from '@/components/Link'
function AdColumn({ width, height, imageLink, referalLink }) {
  return (
    <div className="border-2 border-teal-500 rounded-lg p-1">
      <div>
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
    </div>
  )
}

export default AdColumn
