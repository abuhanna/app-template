import { TransformInterceptor } from './transform.interceptor';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  describe('intercept', () => {
    const mockExecutionContext = {} as ExecutionContext;

    it('should wrap response data in ApiResponse format', (done) => {
      const inputData = { id: 1, name: 'Test' };
      const mockCallHandler: CallHandler = {
        handle: () => of(inputData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result).toHaveProperty('data');
          expect(result).toHaveProperty('timestamp');
          expect(result.data).toEqual(inputData);
        },
        complete: () => done(),
      });
    });

    it('should include a valid ISO timestamp', (done) => {
      const mockCallHandler: CallHandler = {
        handle: () => of({ test: true }),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          const timestamp = new Date(result.timestamp);
          expect(timestamp.toISOString()).toBe(result.timestamp);
        },
        complete: () => done(),
      });
    });

    it('should handle null data', (done) => {
      const mockCallHandler: CallHandler = {
        handle: () => of(null),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result.data).toBeNull();
          expect(result).toHaveProperty('timestamp');
        },
        complete: () => done(),
      });
    });

    it('should handle array data', (done) => {
      const inputData = [{ id: 1 }, { id: 2 }];
      const mockCallHandler: CallHandler = {
        handle: () => of(inputData),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result.data).toEqual(inputData);
          expect(Array.isArray(result.data)).toBe(true);
        },
        complete: () => done(),
      });
    });

    it('should handle string data', (done) => {
      const mockCallHandler: CallHandler = {
        handle: () => of('simple string'),
      };

      interceptor.intercept(mockExecutionContext, mockCallHandler).subscribe({
        next: (result) => {
          expect(result.data).toBe('simple string');
          expect(result).toHaveProperty('timestamp');
        },
        complete: () => done(),
      });
    });
  });
});
