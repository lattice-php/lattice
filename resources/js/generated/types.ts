export type Align = 'center' | 'left' | 'start' | 'stretch';
export type ConditionOperator = 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'not_in';
export type ControlType = 'text' | 'number' | 'date' | 'boolean';
export type EffectType = 'toast' | 'reloadComponent' | 'reloadPage' | 'redirect' | 'download' | 'openModal' | 'closeModal' | 'resetForm';
export type FilterOperator = 'contains' | 'eq' | 'neq' | 'gt' | 'gte' | 'lt' | 'lte' | 'before' | 'after';
export type Gap = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete';
export type PageContainer = 'centered' | 'default';
export type PageLayout = 'app' | 'auth' | 'none';
export type PaginationType = 'none' | 'simple' | 'table' | 'infinite';
export type SortDirection = 'asc' | 'desc';
export type TableSort = {
readonly key: string,
readonly direction: SortDirection,
};
export type ToastVariant = 'success' | 'info' | 'warning' | 'error';
export type Width = 'full' | 'sm' | 'md' | 'lg';
