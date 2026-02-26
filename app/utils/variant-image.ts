export function getMatchedColorAssets(
    variantAssets: any[],
    productAssets: any[],
    selectedVariant: any
): any[] {
    if (variantAssets.length > 0) return variantAssets;

    const colorOption = selectedVariant?.options?.find((opt: any) => {
        const groupName = opt.group?.name?.toLowerCase() || '';
        const groupCode = opt.group?.code?.toLowerCase() || '';
        return (
            ["color", "shade", "colour", "warna"].includes(groupName) ||
            ["color", "shade", "colour", "warna"].includes(groupCode)
        );
    });

    if (colorOption && productAssets.length > 0) {
        const colorNameRaw = colorOption.name.toLowerCase();
        const colorNameKebab = colorNameRaw.replace(/\s+/g, "-");
        const colorNameNoSpace = colorNameRaw.replace(/\s+/g, "");

        const filteredByColor = productAssets.filter((asset: any) => {
            const previewStr = asset.preview?.toLowerCase() || '';
            const assetNameStr = (asset.name || "").toLowerCase();
            return (
                previewStr.includes(colorNameRaw) ||
                previewStr.includes(colorNameKebab) ||
                previewStr.includes(colorNameNoSpace) ||
                assetNameStr.includes(colorNameRaw) ||
                assetNameStr.includes(colorNameKebab) ||
                assetNameStr.includes(colorNameNoSpace)
            );
        });

        return filteredByColor;
    }

    return [];
}

export function getVariantImagePreview(
    productVariant: any,
    fallbackAsset?: any
): string | undefined {
    if (productVariant?.featuredAsset?.preview) {
        return productVariant.featuredAsset.preview;
    }

    const variantAssets = productVariant?.assets?.filter((a: any) => a != null) || [];
    const productAssets = productVariant?.product?.assets?.filter((a: any) => a != null) || [];

    const matchedAssets = getMatchedColorAssets(variantAssets, productAssets, productVariant);

    if (matchedAssets.length > 0) {
        return matchedAssets[0].preview;
    }

    // Fallback to the provided fallback asset or product's featured asset
    return fallbackAsset?.preview || productVariant?.product?.featuredAsset?.preview;
}
