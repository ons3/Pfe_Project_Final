import { gql } from '@apollo/client/core';

export const GET_PROJECTS = gql`
    query GetProjects {
        projets {
            idProjet
            nom_projet
            description_projet
            date_debut_projet
            date_fin_projet
            statut_projet
            equipes {
                idEquipe
                nom_equipe
            }
        }
    }
`;
