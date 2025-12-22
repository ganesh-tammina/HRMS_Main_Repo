import { HttpInterceptorFn } from '@angular/common/http';

export const employeeInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('token');

  // If token exists, clone and add header
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(authReq);
  }

  // Otherwise, pass request as-is
  return next(req);
};
