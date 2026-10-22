import { useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'

export type SelectOption<T extends string> = {
  value: T
  label: string
}

type SelectMenuProps<T extends string> = {
  value: T
  options: readonly SelectOption<T>[]
  onChange: (value: T) => void
  ariaLabel: string
  className?: string
}

type MenuPosition = {
  left: number
  top: number
  width: number
  maxHeight: number
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

export default function SelectMenu<T extends string>({
  value,
  options,
  onChange,
  ariaLabel,
  className = '',
}: SelectMenuProps<T>) {
  const id = useId()
  const triggerRef = useRef<HTMLButtonElement>(null)
  const optionRefs = useRef<Array<HTMLDivElement | null>>([])
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(() => Math.max(0, options.findIndex((option) => option.value === value)))
  const [position, setPosition] = useState<MenuPosition | null>(null)

  const close = (restoreFocus = false) => {
    setOpen(false)
    if (restoreFocus) requestAnimationFrame(() => triggerRef.current?.focus())
  }

  function openMenu(index: number) {
    setActiveIndex(clamp(index, 0, options.length - 1))
    setOpen(true)
  }

  useLayoutEffect(() => {
    if (!open) return

    function updatePosition() {
      const trigger = triggerRef.current
      if (!trigger) return
      const rect = trigger.getBoundingClientRect()
      const viewportPadding = 8
      const width = Math.min(Math.max(rect.width, 190), window.innerWidth - viewportPadding * 2)
      const left = clamp(rect.left, viewportPadding, window.innerWidth - width - viewportPadding)
      const below = window.innerHeight - rect.bottom - viewportPadding
      const above = rect.top - viewportPadding
      const openAbove = below < Math.min(280, options.length * 38) && above > below
      const maxHeight = Math.max(80, Math.min(320, openAbove ? above : below))
      const top = openAbove
        ? Math.max(viewportPadding, rect.top - Math.min(maxHeight, options.length * 38 + 8))
        : rect.bottom + 4

      setPosition({ left, top, width, maxHeight })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [open, options.length])

  useEffect(() => {
    if (!open) return
    const option = optionRefs.current[activeIndex]
    option?.focus({ preventScroll: true })
    option?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex, open])

  useEffect(() => {
    if (!open) return

    function handlePointerDown(event: PointerEvent) {
      const target = event.target
      if (!(target instanceof Node)) return
      if (triggerRef.current?.contains(target) || document.getElementById(id)?.contains(target)) return
      close()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [id, open])

  function handleTriggerKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const selectedIndex = options.findIndex((option) => option.value === value)
      openMenu(selectedIndex < 0 ? 0 : selectedIndex + (event.key === 'ArrowDown' ? 1 : -1))
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      const selectedIndex = options.findIndex((option) => option.value === value)
      openMenu(selectedIndex < 0 ? 0 : selectedIndex)
    }
  }

  function handleOptionKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      close(true)
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      setActiveIndex((index) => (index + (event.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length)
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault()
      setActiveIndex(event.key === 'Home' ? 0 : options.length - 1)
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      selectOption(options[activeIndex].value)
    } else if (event.key.length === 1) {
      const query = event.key.toLocaleLowerCase()
      const matchingIndex = options.findIndex((option) => option.label.toLocaleLowerCase().startsWith(query))
      if (matchingIndex >= 0) setActiveIndex(matchingIndex)
    }
  }

  function selectOption(nextValue: T) {
    onChange(nextValue)
    close(true)
  }

  const selectedOption = options.find((option) => option.value === value)

  return (
    <>
      <button
        ref={triggerRef}
        className={`select-menu-trigger ${className}`.trim()}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => {
          if (open) close()
          else {
            const selectedIndex = options.findIndex((option) => option.value === value)
            openMenu(selectedIndex < 0 ? 0 : selectedIndex)
          }
        }}
        onKeyDown={handleTriggerKeyDown}
      >
        <span className="select-menu-value">{selectedOption?.label ?? value}</span>
        <span className="select-menu-chevron" aria-hidden="true">▾</span>
      </button>
      {open && position && createPortal(
        <div
          className="select-menu-popup"
          id={id}
          role="listbox"
          aria-label={ariaLabel}
          style={{
            left: position.left,
            top: position.top,
            width: position.width,
            maxHeight: position.maxHeight,
          }}
          onKeyDown={handleOptionKeyDown}
        >
          {options.map((option, index) => (
            <div
              ref={(element) => { optionRefs.current[index] = element }}
              className={`select-menu-option${option.value === value ? ' select-menu-option--selected' : ''}${index === activeIndex ? ' select-menu-option--active' : ''}`}
              id={`${id}-option-${index}`}
              role="option"
              aria-selected={option.value === value}
              tabIndex={index === activeIndex ? 0 : -1}
              key={option.value}
              onFocus={() => setActiveIndex(index)}
              onClick={() => selectOption(option.value)}
            >
              {option.label}
            </div>
          ))}
        </div>,
        document.body,
      )}
    </>
  )
}
