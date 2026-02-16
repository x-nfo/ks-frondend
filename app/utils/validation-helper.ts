import type { ErrorResult } from '~/generated/graphql';

export function isErrorResult(input: any): input is ErrorResult {
    return input && (input as ErrorResult).message !== undefined && (input as ErrorResult).errorCode !== undefined;
}
