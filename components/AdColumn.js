import React from 'react'
import Image from './Image'
import Link from '@/components/Link'
function AdColumn({ imageLink, referalLink }) {
  return (
    <div className="border-4 border-teal-500 rounded-lg p-1">
      <Link href={referalLink}>
        <Image
          alt="title"
          src={imageLink}
          className="object-cover object-center "
          width={1054}
          height={1700}
        />
      </Link>
    </div>
  )
}

export default AdColumn
