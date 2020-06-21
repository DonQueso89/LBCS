class LBCSApi {
  constructor(baseUrl: string): string {
    this.baseUrl = new URL(baseUrl)
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
}


const lbcsApi = new LBCSApi("http://192.168.2.18:8888/")
export default lbcsApi;
