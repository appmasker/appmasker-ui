export interface AsyncState<T> {
	isLoading: boolean;
	data: T;
	statusCode?: number;
	message?: string;
	isError?: boolean;
	key?: string;
}
