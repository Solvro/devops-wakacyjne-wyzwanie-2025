import { Controller, Get, HttpCode } from "@nestjs/common";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { AppService } from "./app.service";

@Controller("wakacyjne")
@ApiTags("wakacyjne")
export class AppController {
  constructor(private readonly appService: AppService) {}

  @HttpCode(418)
  @Get("backend")
  @ApiOperation({
    summary: "Jak to jest być skrybą, dobrze?",
    description: `A, wie pan, moim zdaniem to nie ma tak, że dobrze, albo że niedobrze.
Gdybym miał powiedzieć, co cenię w życiu najbardziej, powiedziałbym, że ludzi.
Ludzi, którzy podali mi pomocną dłoń, kiedy sobie nie radziłem, kiedy byłem sam,
i co ciekawe, to właśnie przypadkowe spotkania wpływają na nasze życie.
Chodzi o to, że kiedy wyznaje się pewne wartości, nawet pozornie uniwersalne,
bywa, że nie znajduje się zrozumienia, które by tak rzec, które pomaga się nam rozwijać.
Ja miałem szczęście, by tak rzec, ponieważ je znalazłem, i dziękuję życiu!
Dziękuję mu; życie to śpiew, życie to taniec, życie to miłość!
Wielu ludzi pyta mnie o to samo: ale jak ty to robisz, skąd czerpiesz tę radość? A ja odpowiadam, że to proste!
To umiłowanie życia. To właśnie ono sprawia, że dzisiaj na przykład buduję maszyny, a jutro – kto wie? Dlaczego by nie – oddam się pracy społecznej i będę, ot, choćby, sadzić... doć— m-marchew...`,
  })
  @ApiResponse({
    status: 418,
    description: `I'm a teapot and I don't support coffee; anyway the quote had been retrieved successfully`,
  })
  getHello(): { title: string; quote: string } {
    return this.appService.getHello();
  }

  @HttpCode(200)
  @Get("health")
  @ApiOperation({ summary: "Check application health status" })
  @ApiResponse({
    status: 200,
    description: "Health check successful",
  })
  healthCheck() {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }
}
