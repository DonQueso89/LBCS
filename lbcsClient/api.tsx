class LBCSApi {
  constructor(baseUrl: string): string {
    this.baseUrl = new URL(baseUrl);
  }

  async canConnect() {
    const response = await fetch(new URL(`alive/`, this.baseUrl));
    return response.ok;
  }

  setLed(ledNumber: number, red: Number, green: Number, blue: Number): Promise {
    return fetch(new URL(`state/${ledNumber}/${red.toString().padStart(3, "0")}/${green.toString().padStart(3, "0")}/${blue.toString().padStart(3, "0")}/`, this.baseUrl), {
      method: "POST"
    });
  }

  getDimensions(): Promise {
    return fetch(new URL(`dimensions/`, this.baseUrl));
  }

  state(): Promise {
    return fetch(new URL(`state/`, this.baseUrl), { mode: "cors" });
  }
}

export default LBCSApi;
