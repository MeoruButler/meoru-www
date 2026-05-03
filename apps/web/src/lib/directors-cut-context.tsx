import { createContext, useContext, type ReactNode } from "react"
import { useDirectorsCut } from "./easter-eggs"

export const DirectorsCutContext = createContext<boolean>(false)

export function DirectorsCutProvider({ children }: { children: ReactNode }) {
  const active = useDirectorsCut()
  return (
    <DirectorsCutContext.Provider value={active}>
      {children}
    </DirectorsCutContext.Provider>
  )
}

export function useDirectorsCutState(): boolean {
  return useContext(DirectorsCutContext)
}
