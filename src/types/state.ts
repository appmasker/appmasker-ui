export interface AsyncState<T> {
	isLoading: boolean;
	data: T;
	message?: string;
	isError?: boolean;
	key?: string;
}
