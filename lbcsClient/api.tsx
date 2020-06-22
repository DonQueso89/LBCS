class LBCSApi {
  constructor(baseUrl: string): string {
    this.baseUrl = new URL(baseUrl)
  }

  async canConnect() {
    const response = await fetch(
      new URL(`alive/`, this.baseUrl),
    )
    return response.ok
  }


  setLed(ledNumber: number, on: boolean): Promise {
    return fetch(
      new URL(`state/${ledNumber}/${on ? 1 : 0}/`, this.baseUrl),
      {method: 'POST'}
    )
  }

  getDimensions(): Promise {
    return fetch(
      new URL(`dimensions/`, this.baseUrl),
    )
  }
  
  state(): Promise {
    return fetch(
      new URL(`state/`, this.baseUrl),
      {mode: "cors"}
    )
  }

}


export default LBCSApi;
