import { useRef, useState, type Dispatch, type SetStateAction } from 'react'

export const demoDataKeys = {
  budgets: 'zenvet.demo.budgets.v1',
  schedule: 'zenvet.demo.schedule.v1',
  inventory: 'zenvet.demo.inventory.v1',
  vaccinations: 'zenvet.demo.vaccinations.v1',
  grooming: 'zenvet.demo.grooming.v1',
  prescriptions: 'zenvet.demo.prescriptions.v1',
} as const

type PersistedState<T> = {
  value: T
  canSave: boolean
  error: string | null
}

function readPersistedState<T>(
  key: string,
  initialValue: T,
  isValid: (value: unknown) => value is T,
): PersistedState<T> {
  try {
    const storedValue = window.localStorage.getItem(key)
    if (storedValue === null) return { value: initialValue, canSave: true, error: null }

    const parsedValue: unknown = JSON.parse(storedValue)
    if (isValid(parsedValue)) return { value: parsedValue, canSave: true, error: null }

    return {
      value: initialValue,
      canSave: false,
      error: 'Os dados salvos deste módulo têm um formato inválido e foram preservados. Limpe os dados de demonstração para reiniciar o armazenamento.',
    }
  } catch {
    return {
      value: initialValue,
      canSave: false,
      error: 'Não foi possível ler os dados salvos deste módulo. Eles não serão sobrescritos; verifique o armazenamento do navegador.',
    }
  }
}

export function useDemoData<T>(
  key: string,
  initialValue: T,
  isValid: (value: unknown) => value is T,
): [T, Dispatch<SetStateAction<T>>, string | null] {
  const [persistedState, setPersistedState] = useState(() => readPersistedState(key, initialValue, isValid))
  const persistedStateRef = useRef(persistedState)

  const setValue: Dispatch<SetStateAction<T>> = (nextValue) => {
    const current = persistedStateRef.current
    const value = typeof nextValue === 'function'
      ? (nextValue as (previousValue: T) => T)(current.value)
      : nextValue
    let nextState: PersistedState<T> = { ...current, value }

    if (current.canSave) {
      try {
        window.localStorage.setItem(key, JSON.stringify(value))
      } catch {
        nextState = {
          ...nextState,
          canSave: false,
          error: 'Não foi possível salvar os dados neste navegador. As alterações continuarão disponíveis apenas até fechar ou atualizar a página.',
        }
      }
    }

    persistedStateRef.current = nextState
    setPersistedState(nextState)
  }

  return [persistedState.value, setValue, persistedState.error]
}

export function clearDemoData(): void {
  const clearedValues = [
    [demoDataKeys.budgets, []],
    [demoDataKeys.schedule, []],
    [demoDataKeys.inventory, { items: [], movements: [] }],
    [demoDataKeys.vaccinations, []],
    [demoDataKeys.grooming, []],
    [demoDataKeys.prescriptions, []],
  ] as const

  try {
    const storage = window.localStorage
    const previousValues = clearedValues.map(([key]) => storage.getItem(key))

    try {
      clearedValues.forEach(([key, value]) => storage.setItem(key, JSON.stringify(value)))
    } catch {
      let rollbackFailed = false
      clearedValues.forEach(([key], index) => {
        try {
          const previousValue = previousValues[index]
          if (previousValue === null) storage.removeItem(key)
          else storage.setItem(key, previousValue)
        } catch {
          rollbackFailed = true
        }
      })

      throw new Error(
        rollbackFailed
          ? 'A limpeza não foi concluída e o armazenamento não pôde ser restaurado por completo. Verifique os dados dos módulos antes de continuar.'
          : 'A limpeza não foi concluída. Os dados anteriores foram mantidos.',
      )
    }
  } catch (error) {
    if (error instanceof Error) throw error
    throw new Error('Não foi possível acessar o armazenamento do navegador. Nenhum dado foi limpo.')
  }
}
