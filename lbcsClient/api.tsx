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
}


const lbcsApi = new LBCSApi("http://localhost:8888/")
export default lbcsApi;
