import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';
import { SocketService } from '../../services/socket.service';

@Component({
  selector: 'app-inicio',
  imports: [CommonModule],
  templateUrl: './inicio.component.html',
  styleUrl: './inicio.component.css',
})
export class InicioComponent implements OnInit {
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;

  morseGuia = [
    { letra: 'A', codigo: '.-' },
    { letra: 'B', codigo: '-...' },
    { letra: 'C', codigo: '-.-.' },
    { letra: 'D', codigo: '-..' },
    { letra: 'E', codigo: '.' },
    { letra: 'F', codigo: '..-.' },
    { letra: 'G', codigo: '--.' },
    { letra: 'H', codigo: '....' },
    { letra: 'I', codigo: '..' },
    { letra: 'J', codigo: '.---' },
    { letra: 'K', codigo: '-.-' },
    { letra: 'L', codigo: '.-..' },
    { letra: 'M', codigo: '--' },
    { letra: 'N', codigo: '-.' },
    { letra: 'O', codigo: '---' },
    { letra: 'P', codigo: '.--.' },
    { letra: 'Q', codigo: '--.-' },
    { letra: 'R', codigo: '.-.' },
    { letra: 'S', codigo: '...' },
    { letra: 'T', codigo: '-' },
    { letra: 'U', codigo: '..-' },
    { letra: 'V', codigo: '...-' },
    { letra: 'W', codigo: '.--' },
    { letra: 'X', codigo: '-..-' },
    { letra: 'Y', codigo: '-.--' },
    { letra: 'Z', codigo: '--..' },
    { letra: '1', codigo: '----' },
    { letra: '2', codigo: '..---' },
    { letra: '3', codigo: '...--' },
    { letra: '4', codigo: '....-' },
    { letra: '5', codigo: '.....' },
    { letra: '6', codigo: '-....' },
    { letra: '7', codigo: '--...' },
    { letra: '8', codigo: '--...' },
    { letra: '9', codigo: '---- .' },
  ];

  letras: string[] = [];
  cod: string[] = [];
  palabraSecreta = 'GAMBOA';
  mostrarVideo = false;
  videoUrl = 'Videos/000.mp4';
  repeticiones = 1;

  constructor(
    private socketService: SocketService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    // const modalElement = document.getElementById('videoModal');
    // if (modalElement) {
    //   modalElement.classList.remove('show');
    //   modalElement.setAttribute('aria-hidden', 'true');
    //   modalElement.setAttribute('style', 'display: none');
    // }
    this.socketService.conexion();
    this.socketService.escuchando_evento().subscribe((letra: string) => {
      letra = letra.toUpperCase();
      console.log('Letra recibida:', letra);

      this.letras.push(letra);

      const mensaje = this.letras.join('');

      // Aqui voy a validad si es la palabra incorrecta
      if (!this.palabraSecreta.startsWith(mensaje)) {
        console.log('Letra incorrecta. Reiniciando.');
        Swal.fire({
          icon: 'warning',
          title: 'Ingresaste la letra ' + letra + ' ¡Letra incorrecta!',
          text: `La palabra secreta que debes ingresar es: "${this.palabraSecreta}"`,
          confirmButtonText: 'Espera para reiniciar!',
          timer: 3000,
          timerProgressBar: true,
          customClass: {
            title: 'titulo-personalizado',
          },
        });

        this.letras = [];
        return;
      }

      if (mensaje === this.palabraSecreta) {
        Swal.fire({
          icon: 'success',
          title: 'Palabra correcta!',
          text: `La palabra secreta que ingresaste es: "${this.palabraSecreta}"`,
          confirmButtonText: 'Activando detonación!',
          timer: 4000,
          timerProgressBar: true,
        });
        setTimeout(() => {
          this.mostrarModalVideo();
        }, 4000);
      }
    });
  }

  // mostrarModalVideo() {
  //   console.log('MOSTRAR MODAL');

  //   const modalElement = document.getElementById('videoModal');
  //   if (modalElement) {

  //     const modal = new (window as any).bootstrap.Modal(modalElement, {
  //       backdrop: 'static',
  //       keyboard: false
  //     });
  //     modal.show();

  //     setTimeout(() => {
  //       this.videoElement.nativeElement.currentTime = 0;
  //       this.videoElement.nativeElement.play().catch(console.warn);
  //     }, 300);
  //   }
  // }

  mostrarModalVideo() {
    const modalElement = document.getElementById('videoModal');
    if (modalElement) {
      const modal = new (window as any).bootstrap.Modal(modalElement, {
        backdrop: 'static',
        keyboard: false,
      });
      modal.show();

      // Esperar a que se muestre el modal para reproducir el video
      setTimeout(() => {
        const video = this.videoElement.nativeElement;
        video.muted = true;
        video.currentTime = 0;

        const playPromise = video.play();

        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log('Video reproduciéndose correctamente.');
            })
            .catch((error) => {
              console.warn('Autoplay bloqueado:', error);

              Swal.fire({
                icon: 'info',
                title: 'Presiona para iniciar el video',
                confirmButtonText: 'Iniciar',
              }).then(() => {
                video.play().catch(console.warn);
              });
            });
        }
      }, 300);
    }
  }

  onVideoEndedModal() {
    const modalElement = document.getElementById('videoModal');
    if (modalElement) {
      const modal = (window as any).bootstrap.Modal.getInstance(modalElement);
      modal.hide();
    }

    // Reiniciar al terminar
    this.letras = [];
  }
}
