import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { SearchIcon } from './icons'

export default function SearchBar({ placeholder = 'What are you looking for?' }) {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [value, setValue] = useState(searchParams.get('q') || '')

  const handleSubmit = (e) => {
    e.preventDefault()
    const query = value.trim()
    if (!query) return
    navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  return (
    <form className="w-full" onSubmit={handleSubmit} role="search">
      <div className="relative flex items-center bg-white border border-[#888888] focus-within:border-black rounded-[25px] min-h-[59px] overflow-hidden transition-colors">
        <input
          type="search"
          name="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent outline-none text-[14px] text-black placeholder-[#888888] pl-5 pr-2"
        />
        <button
          type="submit"
          aria-label="Search"
          className="flex items-center justify-center shrink-0 self-stretch w-[59px] bg-cz-accent text-[#888888] cursor-pointer"
        >
          <SearchIcon size={20} />
        </button>
      </div>
    </form>
  )
}
