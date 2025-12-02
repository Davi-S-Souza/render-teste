import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

const activities = [
  {
    icon: "💡",
    title: "Falta de Iluminação ao entardecer",
    subtitle: "Estou notando que meu bairro anda com alguns problemas de iluminação nas principais ruas da...", 
    tags: "#FaltaIluminação #SegurançaPública",
    badge: "Em Revisão"
  },
  {
    icon: "📢",
    title: "Barulho Ensurdecedor",
    subtitle: "Acordei cedo hoje pensando que ia aproveitar minha folga em paz e fazer um café, escutar uma mu... siquinha, colocar a vida em dia. ☕🎶Mas bastou abrir a janela pra levar um susto: PÁÁÁ, TUM-TUM-TUM, VRRRRRR! Várias pessoas andando, martelo, britadeira, gritos… uma verdadeira orquestra do caos! 😵‍💫🔨To achando que eles tão construindo uma nave espacial e não avisaram. [#BarulhoDemais] [#ConstruçãoSemFim] [#CadêASossego] [#TrabalhadoresDoCaos]",
    tags: "#SegurançaJá #BairroEmAlerta #MaisPoliciamento #CentroPop #MenosÉMais",
    badge: "Em Revisão"
  },
  {
    icon: "🚓",
    title: "Policiamento mais Ativo",
    subtitle: "Com a inauguração do novo centro pop no bairro, o índice de roubo aumentou drasticamente, uma boa maneira de contornar isso é aumentando o policiamento na parte noturna.",
    tags: "#Segurança #Polícia #Proteção",
    badge: "Em Revisão"
  }
]

export function Sidebar() {
  return (
    <div 
    id="emAlta"
    className="space-y-4 sticky top-22 z-50">
      {/* Status Card */}
      <Card className="border-green-200">
        <CardContent className="">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm rounded-full px-2 py-2 bg-red-100 text-blue-700">🔥</span>
            <span className="text-sm text-black-600 font-[800]">Denuncias em alta (São José)</span>
          </div>
          
          <div className="space-y-3">
            {activities.map((activity, index) => (
              <div key={index} className="flex gap-3 pb-3 border-b last:border-0">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-500 rounded flex items-center justify-center border-2 border-gray-700">
                  {activity.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 line-clamp-2">
                    {activity.title}
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {activity.subtitle}
                  </p>
                  <p className="text-xs text-gray-400 line-clamp-1">
                    {activity.tags}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}