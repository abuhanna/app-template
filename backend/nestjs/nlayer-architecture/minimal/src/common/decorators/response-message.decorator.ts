import { SetMetadata } from '@nestjs/common';
import { RESPONSE_MESSAGE_KEY, SKIP_TRANSFORM_KEY } from '../interceptors/transform.interceptor';

export const ResponseMessage = (message: string) => SetMetadata(RESPONSE_MESSAGE_KEY, message);
export const SkipTransform = () => SetMetadata(SKIP_TRANSFORM_KEY, true);
