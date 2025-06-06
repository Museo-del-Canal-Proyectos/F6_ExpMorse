# ProyectoFase6Morse

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.0.3.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.

## Codigo Python
import RPi.GPIO as GPIO
import time
import socketio


GPIO.setmode(GPIO.BCM)
GPIO.setwarnings(False)

INPUT_BUTTON = 17
LED = 26
BUZZER = 18

GPIO.setup(INPUT_BUTTON, GPIO.IN, pull_up_down=GPIO.PUD_UP)
GPIO.setup(LED, GPIO.OUT)
GPIO.setup(BUZZER, GPIO.OUT)


frecuencia_telegrama = 800  
buzzer_pwm = GPIO.PWM(BUZZER, frecuencia_telegrama)


sio = socketio.Client()

@sio.event
def connect():
    print("Conectado al servidor")
    print(f"ID de sesión: {sio.sid}")

@sio.event
def disconnect():
    print("🔌 Desconectado del servidor")

sio.connect('https://experience-staging.cuentanostuhistoria.org/', transports=['polling'])


MORSE_A_LETRA = {
    '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E',
    '..-.': 'F', '--.': 'G', '....': 'H', '..': 'I', '.---': 'J',
    '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O',
    '.--.': 'P', '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T',
    '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X', '-.--': 'Y',
    '--..': 'Z', '-----': '0', '.----': '1', '..---': '2',
    '...--': '3', '....-': '4', '.....': '5', '-....': '6',
    '--...': '7', '---..': '8', '----.': '9'
}

UMBRAL_MORSE = 0.3
UMBRAL_LETRA = 1.0


def main():
    morse_actual = ""
    ultimo_tiempo = time.time()

    print("Iniciando detección de Morse...")

    try:
        while True:
            ahora = time.time()

            if GPIO.input(INPUT_BUTTON) == GPIO.LOW:
                inicio = ahora
                GPIO.output(LED, GPIO.HIGH)

                
                buzzer_pwm.start(50)  # % ciclo útil. Subirlo a 50 o más = más volumen

                while GPIO.input(INPUT_BUTTON) == GPIO.LOW:
                    time.sleep(0.01)

                duracion = time.time() - inicio
                GPIO.output(LED, GPIO.LOW)
                buzzer_pwm.stop()

                simbolo = '.' if duracion < UMBRAL_MORSE else '-'
                morse_actual += simbolo
                print(f"Morse parcial: {morse_actual}")
                ultimo_tiempo = time.time()

            if morse_actual and (ahora - ultimo_tiempo) > UMBRAL_LETRA:
                letra = MORSE_A_LETRA.get(morse_actual, '?')
                print(f"Letra detectada: {letra}")
                if letra != '?':
                    sio.emit('portal', letra)
                morse_actual = ""

            time.sleep(0.05)

    except KeyboardInterrupt:
        print("\nPrograma detenido por el usuario")
    finally:
        buzzer_pwm.stop()
        GPIO.cleanup()
        sio.disconnect()

if __name__ == "__main__":
    main()


