import { useFormConfig } from '@custom-hooks/useFormConfig';
import { cursorPointer, mr2, pb1, pb2, pb4, pt2, pt3, px4, textAlignCenter } from '@globalStyles';
import { classNames } from '@helpers/classNames';
import { getPathId } from '@helpers/get-path-id';
import { upsellingStore } from '@stores/swagger/UpsellingStore';
import { Button, ButtonTypes, ButtonSizes } from '@vanguard/Button/Button';
import { ComponentContainer } from '@vanguard/ComponentContainer/ComponentContainer';
import { Form, FormStatus } from '@vanguard/Form/Form';
import { Icon, IconSize } from '@vanguard/Icon/Icon';
import { IconNames } from '@vanguard/Icon/IconNames';
import { Input } from '@vanguard/Input/Input';
import { Modal } from '@vanguard/Modal/Modal';
import { StandardModalProps } from '@vanguard/Modal/ModalRoot/ModalRoot';
import { FontWeights, Text, TextTypes } from '@vanguard/Text/Text';
import React, { useState } from 'react';
import { catchError, EMPTY, take } from 'rxjs';

export type ChangePasswordModalProps = { userEmail: string } & StandardModalProps<boolean>;

export const ChangePasswordModal = (props: ChangePasswordModalProps) => {
  const { close, userEmail } = props;

  // const { upsellingResellerData } = useSelector((state: UpsellingState) => state.ConvertPartnerToDCReducer);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [passwordShown, setPasswordShown] = useState(false);
  const [confirmPasswordShown, setConfirmPasswordShown] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');
  const [formSavable, setFormSavable] = useState(false);

  const formChange = <T,>(formStatus: FormStatus<T>) => {
    setErrorMessage('');
    if (formStatus.hasChanges && formStatus.isValid) {
      setFormSavable(true);
    } else {
      setFormSavable(false);
    }
  };

  const { formConfig } = useFormConfig({
    inputs: {
      password: {
        validation: {
          isPassword: true,
        },
      },
      confirmPassword: {
        validation: {
          isPassword: true,
        },
      },
    },
  });

  const getEndAdornmentForPassword = () => {
    return (
      <Icon
        className={classNames(cursorPointer, mr2)}
        color={passwordShown ? 'var(--fn-fg-lightest)' : 'var(--fn-fg)'}
        type={IconSize.small}
        onClick={() => {
          setPasswordShown(!passwordShown);
        }}
      >
        {IconNames.visibility}
      </Icon>
    );
  };

  const getEndAdornmentForConfirmPassword = () => {
    return (
      <Icon
        className={classNames(cursorPointer, mr2)}
        color={confirmPasswordShown ? 'var(--fn-fg-lightest)' : 'var(--fn-fg)'}
        type={IconSize.small}
        onClick={() => {
          setConfirmPasswordShown(!confirmPasswordShown);
        }}
      >
        {IconNames.visibility}
      </Icon>
    );
  };
  return (
    <ComponentContainer>
      <Modal modalPosition={'center'} fullscreen={false} width={'464px'} animation={'grow'}>
        <div className={classNames(px4, pb2)}>
          <div className={classNames(pt3, pb2)}>
            <Text type={TextTypes.heading4} textAlign={'center'} fontWeight={FontWeights.bold}>
              Add a new password
            </Text>
          </div>
          <Text
            type={TextTypes.text}
            textTight={true}
            fontWeight={FontWeights.regular}
            replacements={{ email: userEmail }}
          >
            The password for the <b>%email%</b> account has expired. Add a new password to access your offer.
          </Text>
        </div>
        <div className={classNames(px4)}>
          <Form config={formConfig} onChange={formChange}>
            <Input
              id={'password'}
              formconfig={formConfig.password}
              className={pb1}
              type={passwordShown ? 'text' : 'password'}
              label={'New password'}
              labelType={'floating'}
              required={true}
              endAdornment={getEndAdornmentForPassword()}
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
              }}
            />
            <Input
              id={'confirmPassword'}
              formconfig={formConfig.confirmPassword}
              type={confirmPasswordShown ? 'text' : 'password'}
              label={'Confirm password'}
              labelType={'floating'}
              required={true}
              endAdornment={getEndAdornmentForConfirmPassword()}
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
              }}
            />
          </Form>

          <Text fontWeight={FontWeights.regular} type={TextTypes.textCaption} color={'--e500'}>
            {errorMessage}
          </Text>
        </div>
        <div className={classNames(textAlignCenter, pt2, pb4)}>
          <Button
            size={ButtonSizes.extraLarge}
            type={ButtonTypes.primary}
            disabled={!formSavable}
            onClick={() => {
              upsellingStore
                .putUpsellingResellerMigratorChangePasswordBySiteId(getPathId(), {
                  password: password,
                  confirmPassword: confirmPassword,
                })
                .pipe(
                  take(1),
                  catchError((err) => {
                    // handle error
                    setErrorMessage(err.response.data.message);
                    return EMPTY;
                  }),
                )
                .subscribe(() => {
                  close &&
                    close({
                      isOk: true,
                    });
                });
            }}
          >
            Save and continue to offer
          </Button>
        </div>
      </Modal>
    </ComponentContainer>
  );
};
