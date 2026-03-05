import { HttpInterceptorFn } from '@angular/common/http';

export const employeeInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const authReq = req.clone({
    setHeaders: headers,
  });

  return next(authReq);
};