import React, { useState, useCallback, useEffect, useRef, useLayoutEffect } from 'react'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { techNameMapping } from '@/data'
import { Technologies, TechNameMappingInterface } from '@/lib/types'

interface IconCycleProps {
  technologies: Technologies
  orientation?: 'h' | 'v'
  iconClass?: string
  view?: 'simple' | 'detailed'
  initialCategory?: keyof Technologies
  initialIconIndex?: number
  onStateChange?: (state: IconCycleState) => void
  onIconClick?: () => void
}

interface IconCycleState {
  currentCategory: keyof Technologies
  cycledIconIndex: number
  highlightedDescriptionIndex: number
}

const HOVER_INTERVAL = 3000 // 3 seconds per icon

const IconCycle: React.FC<IconCycleProps> = ({
  technologies,
  orientation = 'h',
  iconClass = '',
  view = 'detailed',
  initialCategory,
  initialIconIndex = 0,
  onStateChange,
  onIconClick,
}) => {
  const categories = Object.keys(technologies) as (keyof Technologies)[]
  const [currentCategory, setCurrentCategory] = useState<keyof Technologies>(
    initialCategory || categories[0]
  )
  const [hoveredIcons, setHoveredIcons] = useState<string[]>([])
  const [cycledIconIndex, setCycledIconIndex] = useState(initialIconIndex)
  const [highlightedDescriptionIndex, setHighlightedDescriptionIndex] = useState<number>(0)
  const [isFirstRender, setIsFirstRender] = useState(true)
  const [hoveredDescriptionIndex, setHoveredDescriptionIndex] = useState<number | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const isManualHoverRef = useRef(false)
  const allIconsRef = useRef<
    { icon: string; category: keyof Technologies; descriptionIndex: number }[]
  >([])
  const currentCategoryRef = useRef(currentCategory)

  useLayoutEffect(() => {
    allIconsRef.current = categories.flatMap((category) =>
      technologies[category].descriptionParts.flatMap((part, descriptionIndex) =>
        part.icons.map((tech) => ({ icon: tech.icon, category, descriptionIndex }))
      )
    )
  }, [technologies, categories])

  useLayoutEffect(() => {
    currentCategoryRef.current = currentCategory
  }, [currentCategory])

  const handleCategoryClick = useCallback((category: keyof Technologies) => {
    setCurrentCategory(category)
    const firstIconOfCategory = allIconsRef.current.find((icon) => icon.category === category)
    if (firstIconOfCategory) {
      setCycledIconIndex(allIconsRef.current.indexOf(firstIconOfCategory))
      setHighlightedDescriptionIndex(firstIconOfCategory.descriptionIndex)
    } else {
      setCycledIconIndex(0)
      setHighlightedDescriptionIndex(0)
    }
    setHoveredIcons([])
    resetCycling()
  }, [])

  const getTechName = useCallback((iconName: string): string => {
    return (techNameMapping as TechNameMappingInterface)[iconName] || iconName
  }, [])

  const resetCycling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }
    if (!isManualHoverRef.current) {
      startAutoCycle()
    }
  }

  const handleNextCategory = useCallback(() => {
    const currentIndex = categories.indexOf(currentCategory)
    const nextIndex = (currentIndex + 1) % categories.length
    handleCategoryClick(categories[nextIndex])
  }, [categories, currentCategory, handleCategoryClick])

  const handlePreviousCategory = useCallback(() => {
    const currentIndex = categories.indexOf(currentCategory)
    const previousIndex = (currentIndex - 1 + categories.length) % categories.length
    handleCategoryClick(categories[previousIndex])
  }, [categories, currentCategory, handleCategoryClick])

  const startAutoCycle = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      if (!isManualHoverRef.current) {
        setCycledIconIndex((prevIndex) => {
          const nextIndex = (prevIndex + 1) % allIconsRef.current.length
          const nextIcon = allIconsRef.current[nextIndex]

          if (nextIcon.category !== currentCategoryRef.current) {
            setCurrentCategory(nextIcon.category)
            setHighlightedDescriptionIndex(0)
          } else {
            setHighlightedDescriptionIndex(nextIcon.descriptionIndex)
          }

          return nextIndex
        })
      }
    }, HOVER_INTERVAL)
  }, [setCurrentCategory])

  useEffect(() => {
    if (isFirstRender) {
      setCycledIconIndex(initialIconIndex)
      setHighlightedDescriptionIndex(0)
      setIsFirstRender(false)
    } else {
      startAutoCycle()
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isFirstRender, startAutoCycle, initialIconIndex])

  useEffect(() => {
    if (onStateChange) {
      onStateChange({
        currentCategory,
        cycledIconIndex,
        highlightedDescriptionIndex,
      })
    }
  }, [currentCategory, cycledIconIndex, highlightedDescriptionIndex, onStateChange])

  const handleIconHover = useCallback((icon: string, descriptionIndex: number) => {
    const newIndex = allIconsRef.current.findIndex(
      (tech) => tech.icon === icon && tech.category === currentCategoryRef.current
    )
    if (newIndex !== -1) {
      setCycledIconIndex(newIndex)
      setHighlightedDescriptionIndex(descriptionIndex)
      setHoveredIcons([icon])
      isManualHoverRef.current = true
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  const handleIconHoverEnd = useCallback(() => {
    isManualHoverRef.current = false
    setHoveredIcons([])
    startAutoCycle()
  }, [startAutoCycle])

  const handleIconClick = useCallback(
    (icon: string, descriptionIndex: number) => {
      handleIconHover(icon, descriptionIndex)
      if (onIconClick) {
        onIconClick()
      }
    },
    [handleIconHover, onIconClick]
  )

  const handleDescriptionHover = useCallback(
    (index: number) => {
      setHighlightedDescriptionIndex(index)
      setHoveredDescriptionIndex(index)
      const descriptionIcons = technologies[currentCategory].descriptionParts[index].icons
      const icons = descriptionIcons.map((tech) => tech.icon)

      setHoveredIcons(icons)
      isManualHoverRef.current = true
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      const firstIconIndex = allIconsRef.current.findIndex(
        (tech) => tech.icon === icons[0] && tech.category === currentCategory
      )
      if (firstIconIndex !== -1) {
        setCycledIconIndex(firstIconIndex)
      }
    },
    [technologies, currentCategory, setCycledIconIndex]
  )

  const handleDescriptionHoverEnd = useCallback(() => {
    isManualHoverRef.current = false
    setHoveredIcons([])
    setHoveredDescriptionIndex(null)
    startAutoCycle()
  }, [startAutoCycle])

  const formatIconNames = useCallback(
    (icons: string[]): string => {
      if (icons.length === 0) return ''
      if (icons.length === 1) return getTechName(icons[0])
      if (icons.length === 2) return `${getTechName(icons[0])} and ${getTechName(icons[1])}`
      return (
        icons.slice(0, -1).map(getTechName).join(', ') +
        ', and ' +
        getTechName(icons[icons.length - 1])
      )
    },
    [getTechName]
  )

  const currentIcon = allIconsRef.current[cycledIconIndex]

  const getCurrentIcons = useCallback(() => {
    if (hoveredIcons.length > 0) {
      return hoveredIcons
    }
    if (currentIcon) {
      return [currentIcon.icon]
    }
    return []
  }, [hoveredIcons, currentIcon])

  const renderTitle = () => {
    const currentIcons = getCurrentIcons()
    const titleText = formatIconNames(currentIcons)

    return (
      <div className="flex flex-col items-center justify-center mb-4">
        <div className="flex items-center">
          <ChevronLeft
            className="cursor-pointer text-gray-400 hover:text-white transition-colors"
            onClick={handlePreviousCategory}
          />
          <div className="text-center mx-4">
            <h3 className="font-bold text-xl mb-2">{currentCategory}</h3>
          </div>
          <ChevronRight
            className="cursor-pointer text-gray-400 hover:text-white transition-colors"
            onClick={handleNextCategory}
          />
        </div>
        <p className="text-base">{titleText}</p>
      </div>
    )
  }

  const renderTechName = () => {
    let techNames: string[] = []
    if (hoveredDescriptionIndex !== null) {
      techNames = technologies[currentCategory].descriptionParts[hoveredDescriptionIndex].icons.map(
        (tech) => getTechName(tech.icon)
      )
    } else {
      const currentIcons = getCurrentIcons()
      techNames = currentIcons.map(getTechName)
    }

    const formattedNames = techNames.join(', ')

    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={formattedNames}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-lg font-bold text-center mt-4">
          {formattedNames}
        </motion.div>
      </AnimatePresence>
    )
  }

  const renderIcons = () => (
    <div className={`flex ${orientation === 'v' ? 'flex-col' : 'flex-row'} items-start gap-3`}>
      {allIconsRef.current
        .filter((tech) => tech.category === currentCategory)
        .map((tech) => (
          <motion.div
            key={`${currentCategory}-${tech.icon}`}
            className="relative flex flex-col items-center"
            onMouseEnter={() => handleIconHover(tech.icon, tech.descriptionIndex)}
            onMouseLeave={handleIconHoverEnd}
            onClick={() => handleIconClick(tech.icon, tech.descriptionIndex)}
            animate={{
              scale: hoveredIcons.includes(tech.icon) || tech === currentIcon ? 1.2 : 1,
              [orientation === 'v' ? 'x' : 'y']:
                hoveredIcons.includes(tech.icon) || tech === currentIcon ? -5 : 0,
              zIndex: hoveredIcons.includes(tech.icon) || tech === currentIcon ? 10 : 1,
            }}
            transition={{ duration: 0.2 }}>
            <div
              className={`w-10 h-10 rounded-full border-2 p-2 bg-slate-800 overflow-hidden flex flex-col items-center justify-center cursor-pointer ${
                hoveredIcons.includes(tech.icon) || tech === currentIcon
                  ? 'border-blue-500'
                  : 'border-transparent'
              }`}>
              <div className="relative w-full h-full">
                <Image
                  src={`/projectIcons/${tech.icon}`}
                  alt={getTechName(tech.icon)}
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
            </div>
          </motion.div>
        ))}
    </div>
  )

  const renderSimpleView = () => (
    <>
      <div className="flex flex-col items-center justify-center mb-4">
        <div className="flex items-center">
          <ChevronLeft
            className="cursor-pointer text-gray-400 hover:text-white transition-colors"
            onClick={handlePreviousCategory}
          />
          <div className="text-center mx-4">
            <h3 className="font-bold text-xl mb-2">{currentCategory}</h3>
          </div>
          <ChevronRight
            className="cursor-pointer text-gray-400 hover:text-white transition-colors"
            onClick={handleNextCategory}
          />
        </div>
      </div>
      {renderIcons()}
      {renderTechName()}
    </>
  )

  const renderDetailedView = () => (
    <>
      <div className="flex flex-row justify-start bg-blue-400 py-2 px-3 w-fit h-fit rounded-full gap-4  overflow-visible">
        {categories.map((category) => (
          <motion.button
            key={category}
            onClick={() => handleCategoryClick(category)}
            className={`px-2 py-1 text-sm rounded-full transition-all ${
              category === currentCategory
                ? 'bg-gray-300 text-blue-500 shadow-md w-fit'
                : 'bg-transparent text-white hover:bg-blue-300'
            }`}
            whileHover={{ scale: 1.05 }}
            animate={{ scale: category === currentCategory ? 1.1 : 1 }}>
            {category}
          </motion.button>
        ))}
      </div>
      <div className="relative flex flex-col w-full h-40 justify-center items-start mb-4">
        <AnimatePresence mode="wait">
          <div className="w-full">
            <motion.div
              key={currentCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-auto ">
              {technologies[currentCategory].descriptionParts.map((part, index) => (
                <motion.p
                  key={index}
                  className={`flex items-start text-sm w-[80%] cursor-pointer rounded-xl pl-2 py-1 ${
                    index === highlightedDescriptionIndex ? 'bg-slate-700' : ''
                  }`}
                  onMouseEnter={() => handleDescriptionHover(index)}
                  onMouseLeave={handleDescriptionHoverEnd}
                  animate={{
                    x: index === highlightedDescriptionIndex ? 20 : 0,
                    scale: index === highlightedDescriptionIndex ? 1.05 : 1,
                    opacity: index === highlightedDescriptionIndex ? 1 : 0.8,
                  }}
                  transition={{ duration: 0.2 }}>
                  <span className="mr-2">•</span>
                  <span>{part.text}</span>
                </motion.p>
              ))}
            </motion.div>
          </div>
        </AnimatePresence>
      </div>
      {renderIcons()}
      {renderTechName()}
    </>
  )

  return (
    <div className={`flex flex-col items-center justify-center mt-2 space-y-3 w-full ${iconClass}`}>
      {view === 'simple' ? renderSimpleView() : renderDetailedView()}
    </div>
  )
}

export default IconCycle
