import { router } from '@inertiajs/react';
type LocaleReloadProps = Pick<NonNullable<Parameters<typeof router.visit>[1]>, "preserveScroll" | "preserveState">;
export declare function LocaleReload({ preserveScroll, preserveState }: LocaleReloadProps): null;
export {};
