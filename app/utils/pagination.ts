import { z } from 'zod';

export function paginationValidationSchema(
    allowedPaginationLimits: Set<number>,
) {
    const paginationLimitsAsArray = Array.from(allowedPaginationLimits);
    const paginationLimitDerivedMin = Math.min(...paginationLimitsAsArray);
    const paginationLimitDerivedMax = Math.max(...paginationLimitsAsArray);

    const paginationLimitSchema = z
        .coerce.number()
        .int()
        .min(paginationLimitDerivedMin, {
            message: `Limit must be at least ${paginationLimitDerivedMin}`,
        })
        .max(paginationLimitDerivedMax, {
            message: `Maximum limit is ${paginationLimitDerivedMax}`,
        })
        .refine((x) => allowedPaginationLimits.has(x));

    const paginationPageSchema = z
        .coerce.number()
        .int()
        .min(1, { message: 'Page must be at least 1' })
        .max(1000, { message: "Page can't be over 1000" });

    return z.object({
        limit: paginationLimitSchema,
        page: paginationPageSchema,
    });
}

export function translatePaginationFrom(
    appliedPaginationPage: number,
    appliedPaginationLimit: number,
) {
    return (appliedPaginationPage - 1) * appliedPaginationLimit + 1;
}

export function translatePaginationTo(
    appliedPaginationPage: number,
    appliedPaginationLimit: number,
    totalItems: number,
) {
    return (
        translatePaginationFrom(appliedPaginationPage, appliedPaginationLimit) +
        totalItems -
        1
    );
}
