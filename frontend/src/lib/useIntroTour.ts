"use client";

import { useEffect } from "react";

export function useIntroTour() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const hasSeenTour = localStorage.getItem("hasSeenHomeTour");
    
    if (hasSeenTour) {
      return;
    }

    document.body.classList.add('stop-scrolling');

    const timer = setTimeout(async () => {
      const introJs = (await import("intro.js")).default;
      const intro = introJs.tour();

      intro.setOptions({
        steps: [
          {
            title: "Seja bem-vindo ao Corrige Aqui!",
            intro: "Vamos fazer um tour rápido pela plataforma para você conhecer todas as funcionalidades.",
          },
          {
            element: '#nav-home',
            title: "Página Inicial ",
            intro: "Volte sempre para a página inicial para ver o feed de denúncias.",
            position: "bottom",
          },
          {
            element: '#nav-create',
            title: "Criar Nova Denúncia ",
            intro: "Viu algum problema na sua cidade? Clique aqui para criar uma nova denúncia!",
            position: "bottom",
          },
          {
            element: '#nav-maps',
            title: "Mapa de Denúncias ",
            intro: "Visualize todas as denúncias no mapa interativo da sua cidade.",
            position: "bottom",
          },
          {
            element: '#search-bar',
            title: "Buscar Denúncias ",
            intro: "Use a barra de pesquisa para encontrar denúncias específicas na sua região.",
            position: "bottom",
          },
          {
            element: '#nav-notifications',
            title: "Notificações ",
            intro: "Receba notificações sobre suas denúncias e atividades na plataforma.",
            position: "bottom",
          },
          {
            element: '#nav-profile',
            title: "Seu Perfil ",
            intro: "Acesse seu perfil para gerenciar suas denúncias e configurações.",
            position: "bottom",
          },
          {
            element: '#main-feed',
            title: "Feed Principal ",
            intro: "Este é o feed principal onde você verá todas as denúncias. Você pode curtir, comentar e compartilhar!",
            position: "top",
          },
          {
            element: '#infoAdicional',
            title: "Informações Adicionais ",
            intro: "Sidebar com informações úteis e estatísticas da plataforma.",
            position: "left",
          },
          {
            title: "Pronto! ",
            intro: "Agora você já conhece a plataforma. Vamos começar a fazer a diferença na sua cidade!",
          },
        ],
        nextLabel: "Próximo →",
        prevLabel: "← Anterior",
        doneLabel: "Finalizar!",
        skipLabel: "Pular",
        showProgress: true,
        showBullets: false,
        exitOnOverlayClick: false,
        scrollToElement: true,
        tooltipClass: "custom-intro-tooltip",
        highlightClass: "custom-intro-highlight",
      });
      //grava nos cookies so se o cara completar ou sair do tour
      intro.onComplete(() => {
        document.body.classList.remove('stop-scrolling');
        localStorage.setItem("hasSeenHomeTour", "true");
      });

      intro.onExit(() => {
        document.body.classList.remove('stop-scrolling');
        localStorage.setItem("hasSeenHomeTour", "true");
      });

      intro.start();
    }, 1000); 

    return () => {
      clearTimeout(timer);
    };
  }, []);
}

// restarta o tour
export function restartTour() {
  localStorage.removeItem("hasSeenHomeTour");
  window.location.reload();
}
