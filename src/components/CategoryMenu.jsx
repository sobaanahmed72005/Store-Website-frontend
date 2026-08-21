import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ChevronDownIcon } from './icons'
import { useCategories } from '../store/categoryStore'
import { useNavItems } from '../hooks/useNavItems'
import { categorySlugToPath } from '../utils/categoryPath'
import { prefetchCategory } from '../utils/routePrefetch'

export default function CategoryMenu() {
  // Category navigation is now unified into the 3-lines side drawer across Desktop, Tablet & Mobile
  return null
}
