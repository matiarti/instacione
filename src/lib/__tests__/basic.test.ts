import { describe, it, expect } from 'vitest'

describe('Basic functionality', () => {
  it('should perform basic arithmetic', () => {
    expect(2 + 2).toBe(4)
    expect(10 - 5).toBe(5)
    expect(3 * 4).toBe(12)
    expect(8 / 2).toBe(4)
  })

  it('should handle string operations', () => {
    const greeting = 'Hello'
    const name = 'Parcin'
    
    expect(`${greeting} ${name}`).toBe('Hello Parcin')
    expect(greeting.toLowerCase()).toBe('hello')
    expect(name.toUpperCase()).toBe('PARCIN')
  })

  it('should work with arrays', () => {
    const numbers = [1, 2, 3, 4, 5]
    
    expect(numbers.length).toBe(5)
    expect(numbers.includes(3)).toBe(true)
    expect(numbers.filter(n => n > 3)).toEqual([4, 5])
  })

  it('should work with objects', () => {
    const user = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      role: 'DRIVER'
    }
    
    expect(user.name).toBe('Test User')
    expect(user.role).toBe('DRIVER')
    expect(Object.keys(user)).toHaveLength(4)
  })
})
