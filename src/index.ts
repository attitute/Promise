interface STATUS {
  pending: 'PENDING',
  fulfilled: 'FULFILLED',
  rejected: 'REJECTED'
}


export class Promise{
  status: STATUS
  value: any
  reason: any
  resolveCallBack: Array<Function>
  rejecctCallBack: Array<Function>
  constructor(){
    this.status = STATUS
  }

}





