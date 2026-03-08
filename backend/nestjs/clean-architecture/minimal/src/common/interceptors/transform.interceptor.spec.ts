import { TransformInterceptor, RESPONSE_MESSAGE_KEY, SKIP_TRANSFORM_KEY } from './transform.interceptor';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor;
  let reflector: Reflector;

  const mockHandler = jest.fn();
  const mockClass = jest.fn();

  function createMockContext(): ExecutionContext {
    return {
      getHandler: () => mockHandler,
      getClass: () => mockClass,
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    reflector = new Reflector();
    interceptor = new TransformInterceptor(reflector);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should wrap response in success envelope', (done) => {
    const mockContext = createMockContext();
    const mockCallHandler: CallHandler = {
      handle: () => of({ id: 1, name: 'test' }),
    };

    jest.spyOn(reflector, 'get').mockImplementation((key: string) => {
      if (key === SKIP_TRANSFORM_KEY) return undefined;
      if (key === RESPONSE_MESSAGE_KEY) return undefined;
      return undefined;
    });

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result: any) => {
      expect(result.success).toBe(true);
      expect(result.message).toBe('Operation successful');
      expect(result.data).toEqual({ id: 1, name: 'test' });
      done();
    });
  });

  it('should use custom message from ResponseMessage decorator', (done) => {
    const mockContext = createMockContext();
    const mockCallHandler: CallHandler = {
      handle: () => of({ id: 1 }),
    };

    jest.spyOn(reflector, 'get').mockImplementation((key: string) => {
      if (key === SKIP_TRANSFORM_KEY) return undefined;
      if (key === RESPONSE_MESSAGE_KEY) return 'Custom message';
      return undefined;
    });

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result: any) => {
      expect(result.message).toBe('Custom message');
      done();
    });
  });

  it('should pass through null/undefined for 204 responses', (done) => {
    const mockContext = createMockContext();
    const mockCallHandler: CallHandler = {
      handle: () => of(undefined),
    };

    jest.spyOn(reflector, 'get').mockImplementation((key: string) => {
      if (key === SKIP_TRANSFORM_KEY) return undefined;
      if (key === RESPONSE_MESSAGE_KEY) return undefined;
      return undefined;
    });

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result: any) => {
      expect(result).toBeUndefined();
      done();
    });
  });

  it('should flatten paginated responses', (done) => {
    const mockContext = createMockContext();
    const paginatedData = {
      data: [{ id: 1 }],
      pagination: { page: 1, pageSize: 10, totalItems: 1, totalPages: 1, hasNext: false, hasPrevious: false },
    };
    const mockCallHandler: CallHandler = {
      handle: () => of(paginatedData),
    };

    jest.spyOn(reflector, 'get').mockImplementation((key: string) => {
      if (key === SKIP_TRANSFORM_KEY) return undefined;
      if (key === RESPONSE_MESSAGE_KEY) return undefined;
      return undefined;
    });

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result: any) => {
      expect(result.success).toBe(true);
      expect(result.data).toEqual([{ id: 1 }]);
      expect(result.pagination).toBeDefined();
      done();
    });
  });

  it('should skip transform when SKIP_TRANSFORM_KEY is set on handler', (done) => {
    const mockContext = createMockContext();
    const rawData = { id: 1, name: 'raw' };
    const mockCallHandler: CallHandler = {
      handle: () => of(rawData),
    };

    jest.spyOn(reflector, 'get').mockImplementation((key: string, target: any) => {
      if (key === SKIP_TRANSFORM_KEY && target === mockHandler) return true;
      return undefined;
    });

    interceptor.intercept(mockContext, mockCallHandler).subscribe((result: any) => {
      expect(result).toEqual(rawData);
      done();
    });
  });
});
