import { Injectable } from "@nestjs/common";

@Injectable()
export class AppService {
  getHello(): { title: string; quote: string } {
    return {
      title: "Wakacyjne Wyzwanie Solvro!!!",
      quote: `"If you don't know what you want," the doorman said, "you end up with a lot you don't."`,
    };
  }
}
