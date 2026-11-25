export interface InviteUserInput {
  email: string
}

/** O que a página pública do convite mostra antes de a pessoa criar a senha */
export interface InvitationOutput {
  email: string
  /** Nome já informado pela gestão, para vir preenchido; null quando ainda não há */
  fullName: string | null
}

export interface AcceptInvitationInput {
  fullName: string
  password: string
}
