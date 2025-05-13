// src/utils/auth.ts
/**
 * Проверяет, аутентифицирован ли пользователь
 * @returns true если пользователь аутентифицирован
 */
export const isAuthenticated = (): boolean => {
    return !!getToken();
  };
  
  /**
   * Получает токен из localStorage или sessionStorage
   * @returns JWT токен или null
   */
  export const getToken = (): string | null => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };
  
  /**
   * Проверяет наличие роли у текущего пользователя
   * @param requiredRole Требуемая роль
   * @param userRoles Роли пользователя
   * @returns true если пользователь имеет требуемую роль
   */
  export const hasRole = (
    requiredRole: string,
    userRoles: Record<string, string> | undefined
  ): boolean => {
    if (!userRoles) return false;
    return Object.values(userRoles).includes(requiredRole);
  };