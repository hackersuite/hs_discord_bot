export default class MuteTracker extends Map<string, number> {
	public get(key: string) {
		return super.get(key) || 0;
	}

	public increment(key: string) {
		const value = this.get(key) + 1;
		this.set(key, value);
		return value;
	}
}
