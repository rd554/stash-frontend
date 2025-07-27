interface BudgetCapData {
  value: number;
  timestamp: number;
  expiresAt: number;
}

const BUDGET_CAP_EXPIRY_HOURS = 48;
const BUDGET_CAP_PREFIX = 'stash_budget_cap_';

export class BudgetCapStorage {
  private static getKey(username: string, category: string): string {
    return `${BUDGET_CAP_PREFIX}${username}_${category}`;
  }

  private static isExpired(data: BudgetCapData): boolean {
    return Date.now() > data.expiresAt;
  }

  static setBudgetCap(username: string, category: string, value: number): void {
    const key = this.getKey(username, category);
    const data: BudgetCapData = {
      value,
      timestamp: Date.now(),
      expiresAt: Date.now() + (BUDGET_CAP_EXPIRY_HOURS * 60 * 60 * 1000) // 48 hours in milliseconds
    };
    
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save budget cap to localStorage:', error);
    }
  }

  static getBudgetCap(username: string, category: string): number | null {
    const key = this.getKey(username, category);
    
    try {
      const stored = localStorage.getItem(key);
      if (!stored) return null;
      
      const data: BudgetCapData = JSON.parse(stored);
      
      if (this.isExpired(data)) {
        localStorage.removeItem(key);
        return null;
      }
      
      return data.value;
    } catch (error) {
      console.error('Failed to retrieve budget cap from localStorage:', error);
      return null;
    }
  }

  static getAllBudgetCaps(username: string): { [category: string]: number } {
    const caps: { [category: string]: number } = {};
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(BUDGET_CAP_PREFIX) && key.includes(username)) {
          const category = key.replace(BUDGET_CAP_PREFIX, '').replace(`${username}_`, '');
          const value = this.getBudgetCap(username, category);
          if (value !== null) {
            caps[category] = value;
          }
        }
      }
    } catch (error) {
      console.error('Failed to retrieve all budget caps from localStorage:', error);
    }
    
    return caps;
  }

  static clearExpiredBudgetCaps(): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(BUDGET_CAP_PREFIX)) {
          const stored = localStorage.getItem(key);
          if (stored) {
            try {
              const data: BudgetCapData = JSON.parse(stored);
              if (this.isExpired(data)) {
                keysToRemove.push(key);
              }
            } catch {
              // Invalid data, remove it
              keysToRemove.push(key);
            }
          }
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear expired budget caps:', error);
    }
  }

  static clearAllBudgetCaps(username: string): void {
    try {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(BUDGET_CAP_PREFIX) && key.includes(username)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Failed to clear all budget caps for user:', error);
    }
  }
} 