import { Injectable } from '@angular/core';
import { Socket } from 'ngx-socket-io';
@Injectable({
  providedIn: 'root',
})
export class SocketService {
  constructor(private socket: Socket) {}

  conexion() {
    this.socket.on('connect', () => {
      console.log('Conexion con Establecida', this.socket.id);
    });
  }

  escuchando_evento() {
    return this.socket.fromEvent('dataPortal');
  }

  recibirLetras() {
    return this.socket.fromEvent('dataPortal');
  }
}
